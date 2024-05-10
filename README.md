# 콘서트 티케팅

## 요약
- 콘서트 예약 서비스를 구현합니다.
- 대기열 시스템을 구축하고, 예약 서비스는 작업가능한 유저만 수행할 수 있도록 해야합니다.
- 좌석 예약 요청시에, 결제가 이루어지지 않더라도 일정 시간동안 다른 유저가 해당 좌석에 접근할 수 없도록 합니다.

## 주요 기능
 - 대기순서
 사용자가 예약 가능 날짜와 해당 날짜의 좌석을 조회할 때 대기열 토큰(대기 순서 포함)을 생성 합니다.
 대기열 토큰은 결제 완료 시 만료됩니다.
 - 좌석
 사용자는 날짜와 좌석 정보를 입력하여 예약할 수 있습니다.
 좌석은 예약 시 임시로 사용자에게 배정되며, 배정된 시간 동안 다른 사용자의 예약이 불가능합니다.
 결제가 시간 내에 이루어지지 않으면 임시 배정이 해제됩니다.
 - 결제
 결제시 부족한 포인트는 충전과정을 거쳐야 합니다.
 사용자는 결제를 진행하여 좌석을 확정짓습니다.
 결제가 완료되면 대기열 토큰이 만료되고, 좌석 소유권이 사용자에게 이전됩니다.

## 브랜치 전략
 각 phase(dev, cbt, prod)에 맞는 github actions workflow 에 대한 연구와 경험을 위해 Git-flow 전략을 선택했습니다.
 Git-flow에는 5가지 종류의 브랜치가 존재합니다. 항상 유지되는 메인 브랜치들(master, develop)과 일정 기간 동안만 유지되는 보조 브랜치들(feature, release, hotfix)이 있습니다.
 
 master : 제품으로 출시될 수 있는 브랜치
 
 develop : 개발 브랜치로 개발자들이 이 브랜치를 기준으로 각자 작업한 기능들을 Merge
 
 feature : 단위 기능을 개발하는 브랜치로 기능 개발이 완료되면 develop 브랜치에 Merge
 
 release : 배포를 위해 master 브랜치로 보내기 전에 먼저 QA(품질검사)를 하기위한 브랜치
 
 hotfix : master 브랜치로 배포를 했는데 버그가 생겼을 떄 긴급 수정하는 브랜치

## 타임 라인

 [마일스톤](https://github.com/goodmirow-1/ticketing/milestones)  [로드맵](https://github.com/users/goodmirow-1/projects/2/views/1)

## API Spec

 | API | Method | URI | Req | Res
 |----------|----------|----------|----------|----------|
 | 예약 가능 날짜 | Get | /concert/dates |  | [{id,date,availableSeats,concert}] |
 | 예약 가능 좌석 | Get | /concert/:concertDateId/seats |  | [{id,seatNumber,concertDate,status,reservations}] |
 | 좌석 예약 요청 | Post | /concert/:seatId/reservation |  | {id,seatNumber,concertDate,status,reservations} |
 | 잔액 충전 | Patch | /user/charge/:userId/point | 0 | 0 |
 | 잔액 조회 | Get |/user/:userId/point |  | 0 |
 | 결제 | Post |/user-concert/payment/:userId/:reservationId |  | {id,amount,reason,user,reservation,paymentDate} |
 | 유저 토큰 발급 | Get | /user/:userId/token/generate |  | { 'token', 0 } |

## swagger

 ![image](https://github.com/goodmirow-1/ticketing/assets/57578975/ff05bc42-7549-448a-aa19-f8798e2abeeb)

## 다이어그램

 [시퀀스 및 엔티티 릴레이션 링크](https://github.com/goodmirow-1/ticketing/blob/main/documents/README-DIAGRAMS.md)

## 트러블 슈팅

 해당 내용은 시나리오 요구사항에 대한 분석 및 기능 구현시에 고민하고 해결해 나갔던 방법들에 대한 내용이며, 각 이슈당 접근,문제,해결,개선방안(선택) 순으로 나열됩니다.

### 1. 아키텍쳐 설계

 **접근** : 
 
  기존에 자주 사용하던 단일 레이어드는 (Request: Presentation Layer -> Business Layer -> Persistance Layer -> Database Layer)(Response : DB -> Persistance -> Service -> Controller) 의 흐름을 가진다. 이는 상위 계층 → 하위 계층 호출의 단방향 흐름을 유지 하게 됨으로써 하위 계층의 변경이 상위 계층에 영향을 줄 수 있는 문제가 발생한다. 
 
  그래서 다음과 같은 흐름을 가지는 아키텍처를 적용해 도메인을 보호할수 있도록 한다. (controller -> Service -> Repository(interfcae) <- RepositoryImpl->ORM) 와 같이 추상 계층을 만듬으로서 (Request: Presentation -> Business) (Reponse: Database -> Business) 와 같이 business 중심의 흐름을 가질 수가 있다.
 
 **문제** : 
 
 1. 어떤 레이어(디렉토리)들로 구상할것이며, 각각은 어떤 기능을 담당하는가
 
 2. 엔티티들을 도메인별로 어떻게 묶어야하며, 도메인 순수성은 어떻게 확보할 것인가
 
 **해결** :
 
 1. 어떤 레이어(디렉토리)들로 구상할것이며, 각각은 어떤 기능을 담당하는가 : Api(Presentation) / Application ( Business ) / Domain ( abstract ) / Infrastructure ( Persistence ) 로 나뉘었으며 각각의 기능과 파일은 다음과 같습니다.
 
    Api(Presentation) : 외부와 소통하는 역할을 하며 controller,module에 대한 파일을 가지고 있습니다.
 
    Application ( Business ) : Domain단계에서 만들어낸 파편화된 service로직들을 조합하여 usecase에 대한 필요한 기능을 제공과 파일을 가지고 있습니다.
 
    Domain ( abstract ) : Infrastructure에서 필요한 model과 repository에 해당하는 interface 파일들을 가지고 있습니다.
 
    Infrastructure ( Persistence ) : DB와 직접 통신하며 처리하는 기능을 합니다. entity와 repository에 해당하는 파일들을 가지고 있습니다.
    
 2. 엔티티들을 도메인별로 어떻게 묶어야하며, 도메인 순수성은 어떻게 확보할 것인가 :  먼저 엔티티들을 도메인에 크게 비슷한 계열로 묶어야 한다고 판단했습니다. 그래서 Concert / User 으로 묶었고 각 도메인별 포함 엔티티는 다음과 같습니다. Concert ( Concert, ConcertDate, Seat, Reservation ) / User ( User, PointHistory )
 
 그리고 도메인의 순수성을 확보하기 위해서 서로 다른 도메인끼리는 joinColumn이 아닌 Application join을 사용하게끔 하였습니다.
 
 **개선방안** :
 
 1. Concert 도메인의 책임 분리를 위해 예약 좌석을 결제하는 도메인(Reservation, Payment)를 나누는 방법도 생각해 볼 수 있습니다.
 
 ### 2. 동시성 제어 (DB)
 
 **접근** :
 
 1. 프로젝트 내에서 동시성 제어를 해야하는 부분은 두가지로 나눌 수 있었습니다. 
 첫번째 : 사용자의 포인트 충전은 순차적으로 진행되어야 한다. 
 두번째 : 좌석 예약에 대한 결제 처리 중 사용자의 포인트 차감은 일관화 되게 진행되어야 한다.
 * 첫번째 두번째는 서로의 진행이 동시에 발생하게 되면 사용자 포인트의 정합성이 맞지 않을 수 있는 문제가 발생할 수 있으므로 분산락이 아닌 비관적 락을 사용한다.
 
 ### 3. 서버 부하를 제한하기 위한 대기열 구현 (Redis)
 
 **접근** :
 
 1. 대기열의 동시성 제어를 위해 Redis를 사용해야하는 이유는 다음과 같습니다.
    
  첫번째 : Redis와 같은 분산락을 활용하면 다른 인스턴스 서버에 대한 일관된 락을 제공 할 수 있습니다.
 
  두번째 : 분산락의 핵심은 분산된 서버/클러스터 간에도 Lock 을 보장하는 것입니다.
  
  세번째 : key-value 기반의 원자성을 이용한 Redis 를 통해 DB 부하를 최소화하는 Lock 을 설계할 수 있습니다.
  
  네번째 : 기존 db에서의 방식은 매 초 스케줄러를 통해 대기열에서 하나씩 꺼내서 유효 토큰으로 변환시키는 방식이었는데 이는 성능, 에러에 대한 제어 등에 대해 효율적으로 관리하기 힘듬으로 redis의 set, list, sorted set 등의 방식을 활용하면 보다 효율적으로 관리할 수 있다.
 
 *시스템 설계에 대한 내용은 다음 링크에 있습니다. [링크](https://github.com/goodmirow-1/ticketing/milestones)
 
 * redis를 활용한 대기열 기능 구현은 다음과 같다.
 1. jwt.sign을 활용하여 토큰을 생성 및 api에 대한 접근 관리와, redis.set('token:${userId}, ...)을 활용하여 유효토큰 만료를 관리한다.
 2. redis.acquirelock를 사용해 lock을 얻고 프로세스 끝난후 redis.releaselock을 통해 락을 해제한다.
 3. 사용자는 process.env.MAX_CONNECTION와 redis.scan(...)으로 접근에 대한 수를 제한한다.
 3. 특정 수를 넘으면  redis.lpush('waitingQueue', userId)을 통해 대기열에 진입한다.
 4. redis의 스케줄러를 통한 일정 수를 대기열에서 유효 토큰으로 전환한다.
 5. 사용자는 user/generateToken/ api만을 사용해서 계속해서 접근요청을 하며 4번이 되었을 경우 이후 프로세스를 진행할 수 있다.
 6. 대기중이던 사용자는 폴링을 통해 redis.lrange('waitingQueue', 0, -1).indexof()를 사용하여 현재 대기중인 위치를 알 수 있다.
 
 **문제** :
 1. 기존 DB에서 구현했던 대기열에서 비효율적이던 부분(단일 인스턴스의 scheduler와 관련 API가 추가됨)을 발견했다.
 3. 키 만료시 이벤트는 등록의 수에 제한이 있으므로, 스케줄러를 통한 일정 수를 대기열에서 유효 토큰으로 전환하는 과정을 가진다.
 
 **해결** :
 1. 토큰 발급 관련 단일 API로 수정되었으며, 단일 인스턴스에서만 제어가 되던 Scheduler를 Redis로 실행한다.
