# 14조 김국현 - 티케팅


## 브랜치 전략
각 phase(dev, cbt, prod)에 맞는 github actions workflow 에 대한 연구와 경험을 위해 Git-flow 전략을 선택했습니다.
Git-flow에는 5가지 종류의 브랜치가 존재합니다. 항상 유지되는 메인 브랜치들(master, develop)과 일정 기간 동안만 유지되는 보조 브랜치들(feature, release, hotfix)이 있습니다.

master : 제품으로 출시될 수 있는 브랜치

develop : 개발 브랜치로 개발자들이 이 브랜치를 기준으로 각자 작업한 기능들을 Merge

feature : 단위 기능을 개발하는 브랜치로 기능 개발이 완료되면 develop 브랜치에 Merge

release : 배포를 위해 master 브랜치로 보내기 전에 먼저 QA(품질검사)를 하기위한 브랜치

hotfix : master 브랜치로 배포를 했는데 버그가 생겼을 떄 긴급 수정하는 브랜치

## 요약
- 콘서트 예약 서비스를 구현합니다.
- 대기열 시스템을 구축하고, 예약 서비스는 작업가능한 유저만 수행할 수 있도록 해야합니다.
- 좌석 예약 요청시에, 결제가 이루어지지 않더라도 일정 시간동안 다른 유저가 해당 좌석에 접근할 수 없도록 합니다.

## 타임 라인
[마일스톤](https://github.com/goodmirow-1/ticketing/milestones)  [로드맵](https://github.com/users/goodmirow-1/projects/2/views/1)

## 주요 기능
1. 대기시간
사용자가 예약 가능 날짜와 해당 날짜의 좌석을 조회할 때 대기열 토큰(대기 순서 포함)을 생성 합니다.
대기열 토큰은 결제 완료 시 만료됩니다.
2. 좌석
사용자는 날짜와 좌석 정보를 입력하여 예약할 수 있습니다.
좌석은 예약 시 임시로 사용자에게 배정되며, 배정된 시간 동안 다른 사용자의 예약이 불가능합니다.
결제가 시간 내에 이루어지지 않으면 임시 배정이 해제됩니다.
3. 결제
결제시 부족한 포인트는 충전과정을 거쳐야 합니다.
사용자는 결제를 진행하여 좌석을 확정짓습니다.
결제가 완료되면 대기열 토큰이 만료되고, 좌석 소유권이 사용자에게 이전됩니다.
## API Spec

| API | Method | URI | Req | Res
|----------|----------|----------|----------|----------|
| 유저 토큰 발급 | Get | /user-waiting/:userId/token/generate |  | { 'token', 0 } |
| 토큰 상태 조회 | Get | /user-waiting/token/status |  | { 'token', 0 } or 0 |
| 예약 가능 날짜 | Get | /concert/dates |  | [{id,date,availableSeats,concert}] |
| 예약 가능 좌석 | Get | /concert/:concertDateId/seats |  | [{id,seatNumber,concertDate,status,reservations}] |
| 좌석 예약 요청 | Post | /concert/:seatId/reservation |  | {id,seatNumber,concertDate,status,reservations} |
| 잔액 충전 | Patch | /user/charge/:userId/point | 0 | 0 |
| 잔액 조회 | Get |/user/:userId/point |  | 0 |
| 결제 | Post |/user-concert/payment/:userId/:reservationId |  | {id,amount,reason,user,reservation,paymentDate} |

## 시퀀스 다이어그램
### 유저 토큰 발급
   
![image](https://github.com/goodmirow-1/ticketing/assets/57578975/1d83edd8-213a-4e98-a59e-f292e208936c)

### 예약 가능 날짜 / 좌석 조회
   
![image](https://github.com/goodmirow-1/ticketing/assets/57578975/1341b2e0-da85-4af9-8fe8-c0c1752c8105)

### 좌석 예약

![image](https://github.com/goodmirow-1/ticketing/assets/57578975/17d6dfd2-1db8-4f72-8aa5-203dec3fb594)

### 잔액 조회 / 충전

![image](https://github.com/goodmirow-1/ticketing/assets/57578975/18bc2740-0ae8-4cdf-9278-3a9611a28e91)

### 결제

![image](https://github.com/goodmirow-1/ticketing/assets/57578975/b2b5944a-dcae-4393-b1b4-3cedb2d941e3)


## 엔티티 릴래이션 다이어그램 ( ERD )

1. 대기열 역할을 하는 WaitingUser 테이블, 유효한 토큰을 관리하는 ValidToken 테이블로 대기열을 관리함
2. Seat 테이블의 concertDateId, status를 Index로 설정해서 콘서트 좌석 조회에 대한 성능을 높임
3. Reservation 테이블의 consertId,consertDateId,seatId 값을 복합 유니크키로 설정해서 낙관적 락을 사용할 수 있게 함

![1](https://github.com/goodmirow-1/ticketing/assets/57578975/eff8f658-b15f-4f1d-9801-b28bf49e03c6)

## swagger

![image](https://github.com/goodmirow-1/ticketing/assets/57578975/ff05bc42-7549-448a-aa19-f8798e2abeeb)


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
   
2. 엔티티들을 도메인별로 어떻게 묶어야하며, 도메인 순수성은 어떻게 확보할 것인가 :  먼저 엔티티들을 도메인에 크게 비슷한 계열로 묶어야 한다고 판단했습니다. 그래서 Concert / User / Waiting 으로 묶었고 각 도메인별 포함 엔티티는 다음과 같습니다. Concert ( Concert, ConcertDate, Seat, Reservation ) / User ( User, PointHistory ) / Waiting ( ValidToken, WaitingUser ) 

그리고 도메인의 순수성을 확보하기 위해서 서로 다른 도메인끼리는 joinColumn이 아닌 Application join을 사용하게끔 하였습니다.

**개선방안** :

1. 유닛, 통합 테스트가 아직 레이어드 별로 구성되어있지 않으므로 적절한 단계의 test들이 적용되어야 할 것 입니다.

### 2. 동시성제어

**접근** :

1. 프로젝트 내에서 동시성 제어를 해야하는 부분은 크게 두가지로 나눌 수 있었습니다. 첫번째 : 일정량의 유효토큰을 발급해야 하며 나머지는 대기토큰으로 발급한다. 두번째 : 사용자의 포인트 충전은 순차적으로 진행되어야 한다. 또한 typeorm의 특성상 lock의 종류를 여러가지 택할 수가 있으며, db의 격리 수준과 lock을 상황에 맞추어 적절하게 사용해야할 것입니다.

**문제** : 

1. 일정량의 유효토큰을 발급해야 하며 나머지는 대기토큰으로 발급한다

대기열 기능과 토큰에 따른 테이블을 ValidToken(유효 토큰), WaitingUser(대기열) 로 나누어 관리했습니다. 그리고 유효 토큰 발급을 위한 플로우는 다음과 같습니다.

사용자 토큰 발급 요청 -> ValidToken에서 유효 토큰의 Count를 조회 후 수용 가능 인원인지 판단 -> 수용 가능 인원일 경우 유효 토큰 발급하며 ValidToken에 저장

DB의 격리 수준을 'REPEATABLE READ'로 Lock을 'pessimistic_write'로 사용했을 경우 deadlock이 발생함

**해결** :

1. deadlock의 원인에 대해 먼저 파악했습니다. 원인은 테이블의 Count를 조회하는 것은 DB에서 트랜잭션 A에서 조건에 만족하는 Row들을 계산하는 도중에 다른 트랜잭션 B에서 (예약시 유효 토큰을 만료상태로 변환) 하거나 다른 트랜잭션 C에서 유효 토큰 발급을 시도할 경우들로 확인했고, 그에 따라 격리수준을 'COMMITTED READ'로 낮추었을때 Count(읽기 작업) 시도시 Lock을 걸지 않기 때문에 deadlock이 발생하지 않았습니다.

**개선방안** :

1. typeorm의 transaction lock의 종류에는 pessimistic_partial_write(비관적인 부분 쓰기 락)이 존재합니다. 이는 테이블의 특정 필드에만 Lock을 걸 수 있는 부분이며 상황에 따라 성능을 높일 수 있는 락이다. 현재 user의 point를 다른 테이블로 관리하는게 아니라 하나의 column으로 관리하고 있는데, 요구사항에 user의 필드들이 변할 수 있는 조건이 없었기 때문이다. 만약 다른 필드들이 수정되어야 하는 상황이 발생하여 최적화 하는 상황이 발생한다면, db의 정규화 없이도 pessimistic_partial_write을 사용해서 충분히 해결할 수 있을 것으로 보인다. 하지만 이 부분은 table이 typeorm에 의존되게 되므로 있으므로 "db나 orm이 절대적으로 변하지 않는다" 라는 것이 가정되어야 할 것이다.
