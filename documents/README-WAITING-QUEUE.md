# 대기열 구현을 위한 시스템 설계

## API목록
    • 유효 토큰 발급
        - Get /user/:userId/token/generate
            <유효 토큰일 경우>
            -- Reqeust : 유저 아이디
            -- Response : token, 0, 잔여시간
            <대기열에 등록된 경우>
            -- Request : 유저 아이디
            -- Response : token, 대기순번, 잔여시간
    • 포인트 충전
        - Patch /user/charge/:userId/point
            -- Request : 유저 아이디
            -- Response : 충전포인트
    • 포인트 조회
        - Get /user/:userId/point
            -- Reqeust: 유저 아이디
            -- Response : 포인트 잔액
    • 콘서트 날짜 조회
        - Get /concert/dates
            -- Header : token
            -- Response : 전체 예약 날짜 조회
    • 예약 가능 좌석 조회
        - Get /concert/:concertDateId/seats
            -- Header : token
            -- Request : 콘서트 날짜 아이디
            -- Response : 날짜별 좌석 예약 가능 좌석에 대한 목록
    • 좌석 예약 요청
        - Post /concert/:seatId/reservation
            -- Header : token
            -- Request : 좌석 아이디
            -- Response : 해당 좌석에 예약된 정보
    • 결제
        - Post /user-concert/payment/:userId/:reservationId
            -- Request : 사용자 아이디, 예약 아이디
            -- Response : 결제 일시, 금액 등의 정보

## 유효 토큰과 대기열
    • 유효 토큰은 유저가 서비스를 이용하기에 앞서 서비스를 이용할 수 있는 토큰인지를 검증하기 위해 사용됩니다. 대규모 트래픽이 한번에 도메인 서비스에 접근하는 것을 방지할 수 있습니다.
    • 유효 토큰은 Redis를 활용하여 관리합니다. 사용 이유는 다음과 같습니다.
        - Redis와 같은 분산락을 활용하면 다른 인스턴스 서버에 대한 일관된 락을 제공 할 수 있습니다.
        - 분산락의 핵심은 분산된 서버/클러스터 간에도 Lock 을 보장하는 것입니다.
        - key-value 기반의 원자성을 이용한 Redis 를 통해 DB 부하를 최소화하는 Lock 을 설계할 수 있습니다.
    • 유효 토큰은 서비스를 이용할 수 있습니다. 사용이 완료되었거나, 만료된 토큰은 삭제하면 되기에 별도의 상태를 관리하지 않습니다.
        - Waiting Queue
            - list 자료구조로 저장됩니다.
            - userId값을 lpush로 신규 대기열을 추가하고, lrange와 indexof를 사용해 자신의 대기 순번을 확인합니다.
        - Valid Token
            - sets 자료구조로 저장되며, key로는 userId를 member로는 token(유저정보, 만료일시)을 저장합니다.
            - get을 통해 key값에 해당하는 데이터의 유무를 확인하고, 예약 서비스를 이용할 수 있게 합니다.
            - 데이터 전체를 검색하는 smemeber or keys를 사용하기보단 일정 수를 검색하는 sscan을 사용해 유효 토큰의 수를 관리합니다.
            - 결제 완료시 해당 토큰을 삭제하며, Redis Scheduler를 통해 일정 시간 및 수량만큼 Waiting Queue에서 lpop을 통해 userId를 획득하고 유효 토큰으로 등록합니다.
            - 또한 일정주기로 Active Tokens에 만료일시가 지난 토큰들은 삭제됩니다.

## Active Tokens 전환 방식

    • Active Tokens 에서 만료된 토큰의 수만큼 Waiting Tokens에서 전환
        - 서비스를 이용할 수 있는 유저를 항상 일정 수 이하로 유지할 수 있다.
        - 서비스를 이용하는 유저의 액션하는 속도에 따라 대기열의 전환시간이 불규칙하다.
    • N초마다 M개의 토큰을 Active Tokens 으로 전환
        - 대기열 고객에게 서비스 진입 가능 시간을 대체로 보장할 수 있다.
        - 서비스를 이용하는 유저의 수가 보장될 수 없다.

## 설계 방향성 선정 과정

    • 앞사람이 완료하지 않으면 뒷사람이 들어갈 수 없어야 하는가?
        - 서비스에 먼저 접근했기에 절대적인 우선권을 주는 것이 아닌, 동시 접속자에 의한 시스템 부하를 막기 위해 트래픽을 제한하는 것이 목적이므로 2번 채택
    • 적절한 동시 접속자를 유지하기 위해서는?
        - 한 유저가 콘서트 조회를 시작한 이후에 하나의 예약을 완료할 때까지 걸리는 시간을 파악
            - 평균 2분
        - DB에 동시에 접근할 수 있는 트래픽의 최대치를 계산
            - 약 20 TPS(초당 트랜잭션 수) ⇒ 1분당 1,200명
        - 1분간 유저가 호출하는 API 
            - 4(콘서트 날짜, 좌석 조회하는 API, 예약 API, 결제하는 API) * 1.5 ( 동시성 이슈에 의해 예약에 실패하는 케이스를 위한 재시도 계수(예측치)) = 6
        - 분당 처리할 수 있는 동시접속자 수 = 600명
            - 5초마다 50명씩 유효한 토큰으로 전환, 100명으로 전환시 read ECONNRESET가 자주발생함.
            - 나의 대기열 순번이 1,000 번이라면 잔여 예상대기시간은 3분 10초 = e2e테스트 결과 160초로 예측치 유사함
    • 유효 토큰이 있는데 JWT와 JwtAuthGuard는 필요한가?
        - JwtAuthGuard은 CanActivate 인터페이스를 구현, boolean형을 반환하는 validate 메서드를 통해 접근을 허용하거나 거부한다. 그로써 유효성 검증을 통과한 토큰만 controller->command->usecase 까지 데이터를 넘길 수 있게 된다.
        - Jwt를 사용하게 되면 토큰을 이중으로 관리하게 되지만, 불필요한 사용자들이 usecase까지 접근되는 부분을 막을 수 있다.
        - 해서 Redis를 사용한 단일 토큰 관리보단, Jwt토큰을 사용해서 접근을 제한한다.

