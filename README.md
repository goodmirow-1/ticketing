# Concert Ticketing Server

TDD 기반 콘서트 티케팅 서버 구축 프로젝트 입니다.

# 목차

-   [요약](#요약)
-   [주요 기능](#주요기능)
-   [Git Branch 전략](#git-branch-전략)
    -   [서버 환경](#서버-환경-분리)
    -   [브랜치 전략](#브랜치-전략)
-   [ERD](#erd)
-   [타임 라인](#타임라인)
-   [APIS](#apis)
-   [시퀀스 다이어그램](#시퀀스다이어그램)
    -   [유저 토큰 발급](#유저-토큰-발급)
    -   [예약 가능 날짜 및 좌석 조회](#예약-가능-날짜-및-좌석-조회)
    -   [좌석 예약](#좌석-예약)
    -   [잔액 조회 및 충전](#잔액-조회-및-충전)
    -   [결제](#결제)
-   [트러블 슈팅](#트러블슈팅)
    -   [아키텍쳐 설계](#아키텍쳐-설계)
    -   [동시성 제어](#동시성-제어)
-   [프로젝트 회고](#프로젝트-회고)

# 요약

-   콘서트 예약 서비스를 구현합니다.
-   대기열 시스템을 구축하고, 예약 서비스는 작업가능한 유저만 수행할 수 있도록 해야합니다.
-   좌석 예약 요청시에, 결제가 이루어지지 않더라도 일정 시간동안 다른 유저가 해당 좌석에 접근할 수 없도록 합니다.

# 주요기능

-   대기순서
    사용자가 예약 가능 날짜와 해당 날짜의 좌석을 조회할 때 대기열 토큰(대기 순서 포함)을 생성 합니다.
    대기열 토큰은 결제 완료 시 만료됩니다.
-   좌석
    사용자는 날짜와 좌석 정보를 입력하여 예약할 수 있습니다.
    좌석은 예약 시 임시로 사용자에게 배정되며, 배정된 시간 동안 다른 사용자의 예약이 불가능합니다.
    결제가 시간 내에 이루어지지 않으면 임시 배정이 해제됩니다.
-   결제
    결제시 부족한 포인트는 충전과정을 거쳐야 합니다.
    사용자는 결제를 진행하여 좌석을 확정짓습니다.
    결제가 완료되면 대기열 토큰이 만료되고, 좌석 소유권이 사용자에게 이전됩니다.

# Git branch 전략

## 서버 환경 분리

`dev` : 자유롭게 기능 개발을 위한 개발 환경

`prod` : 실제 서비스가 운영되는 환경

&#43; `staging` : 실제 운영 환경과 동일한 환경에서 QA 하기 위한 테스트 환경

## 브랜치 전략

`feature`

-   기능 단위 개발 브랜치
-   develop 브랜치 기준으로 생성되는 브랜치로 기능 구현을 하기 위한 브랜치
-   브랜치명 컨벤션 feat/{issue-number}/{구현 기능명} **(e.g. feat/issue-30/order)**

**feature 브랜치 > develop 브랜치에 merge 기준**

-   CI 통과
-   pr 코드리뷰 완료 및 approve 2인 이상

`develop`

-   dev 환경에 배포되는 브랜치로, feature 브랜치에서 기능 구현이 완료된 커밋들이 합쳐지는 브랜치
-   develop 브랜치에 커밋 merge 시 dev 환경의 application 배포

`release`

-   배포 대상인 develop 브랜치의 커밋들이 모여 운영 환경과 동일한 환경우로 배포하여 QA 하기 위한 브랜치
-   develop 브랜치에서 개발 및 테스트가 끝나고, production에 배포 되기 전 production과 동일한 환경(staging)에서 테스트하기 위한 브랜치

**main 브랜치에 merge 기준**

-   staging 환경에서 테스트 완료

`main`

-   release 브랜치에서 테스트가 끝난 후 운영 환경에 배포하는 브랜치

<br />

# ERD

1. concertDate 테이블의 concert를 Index로 설정해서 관계 조회에 대한 성능을 높임
2. Seat 테이블의 concertDateId를 Index로 설정해서 콘서트 좌석 조회에 대한 성능을 높임
3. Reservation 테이블의 consertId,consertDateId,seatId 값을 복합 유니크키로 설정해서 낙관적 락을 사용할 수 있게 함

<img width="820" alt="image" src="https://github.com/goodmirow-1/ticketing/assets/57578975/eff8f658-b15f-4f1d-9801-b28bf49e03c6">

# 타임라인

[마일스톤](https://github.com/goodmirow-1/ticketing/milestones) [로드맵](https://github.com/users/goodmirow-1/projects/2/views/1)

# APIS

<img width="820" alt="image" src="https://github.com/goodmirow-1/ticketing/assets/57578975/ff05bc42-7549-448a-aa19-f8798e2abeeb">

# 시퀀스다이어그램

## 유저 토큰 발급

<img width="820" alt="image" src="https://github.com/goodmirow-1/ticketing/assets/57578975/1ad4dec7-c3b3-45d0-aa4b-1a8a75f89bce">

## 예약 가능 날짜 및 좌석 조회

<img width="820" alt="image" src="https://github.com/goodmirow-1/ticketing/assets/57578975/1341b2e0-da85-4af9-8fe8-c0c1752c8105">

## 좌석 예약

<img width="820" alt="image" src="https://github.com/goodmirow-1/ticketing/assets/57578975/17d6dfd2-1db8-4f72-8aa5-203dec3fb594">

## 잔액 조회 및 충전

<img width="820" alt="image" src="https://github.com/goodmirow-1/ticketing/assets/57578975/18bc2740-0ae8-4cdf-9278-3a9611a28e91">

## 결제

<img width="820" alt="image" src="https://github.com/goodmirow-1/ticketing/assets/57578975/b2b5944a-dcae-4393-b1b4-3cedb2d941e3">

# 트러블슈팅

해당 내용은 시나리오 요구사항에 대한 분석 및 기능 구현시에 고민하고 해결해 나갔던 방법들에 대한 내용이며, 각 이슈당 접근,문제,해결,개선방안(선택) 순으로 나열됩니다.

## 아키텍쳐 설계

**접근** :

기존에 자주 사용하던 단일 레이어드는 (Request: Presentation Layer -> Business Layer -> Persistance Layer -> Database Layer)(Response : DB -> Persistance -> Service -> Controller) 의 흐름을 가진다. 이는 상위 계층 → 하위 계층 호출의 단방향 흐름을 유지 하게 됨으로써 하위 계층의 변경이 상위 계층에 영향을 줄 수 있는 문제가 발생한다.

그래서 다음과 같은 흐름을 가지는 아키텍처를 적용해 도메인을 보호할수 있도록 한다. (controller -> Service -> Repository(interfcae) <- RepositoryImpl->ORM) 와 같이 추상 계층을 만듬으로서 (Request: Presentation -> Business) (Reponse: Database -> Business) 와 같이 business 중심의 흐름을 가질 수가 있다.

**문제** :

1.  어떤 레이어(디렉토리)들로 구상할것이며, 각각은 어떤 기능을 담당하는가

2.  엔티티들을 도메인별로 어떻게 묶어야하며, 도메인 순수성은 어떻게 확보할 것인가

**해결** :

1.  어떤 레이어(디렉토리)들로 구상할것이며, 각각은 어떤 기능을 담당하는가 : Api(Presentation) / Application ( Business ) / Domain ( abstract ) / Infrastructure ( Persistence ) 로 나뉘었으며 각각의 기능과 파일은 다음과 같습니다.

    Api(Presentation) : 외부와 소통하는 역할을 하며 controller,module에 대한 파일을 가지고 있습니다.

    Application ( Business ) : Domain단계에서 만들어낸 파편화된 service로직들을 조합하여 usecase에 대한 필요한 기능을 제공과 파일을 가지고 있습니다.

    Domain ( abstract ) : Infrastructure에서 필요한 model과 repository에 해당하는 interface 파일들을 가지고 있습니다.

    Infrastructure ( Persistence ) : DB와 직접 통신하며 처리하는 기능을 합니다. entity와 repository에 해당하는 파일들을 가지고 있습니다.

2.  엔티티들을 도메인별로 어떻게 묶어야하며, 도메인 순수성은 어떻게 확보할 것인가 : 먼저 엔티티들을 도메인에 크게 비슷한 계열로 묶어야 한다고 판단했습니다. 그래서 Concert / User 으로 묶었고 각 도메인별 포함 엔티티는 다음과 같습니다. Concert ( Concert, ConcertDate, Seat, Reservation ) / User ( User, PointHistory )

그리고 도메인의 순수성을 확보하기 위해서 서로 다른 도메인끼리는 joinColumn이 아닌 Application join을 사용하게끔 하였습니다.

**개선방안** :

1.  Concert 도메인의 책임 분리를 위해 예약 좌석을 결제하는 도메인(Reservation, Payment)를 나누는 방법도 생각해 볼 수 있습니다.

## 동시성 제어

**접근** :

1.  프로젝트 내에서 동시성 제어를 해야하는 부분은 두가지로 나눌 수 있었습니다.

첫번째 : 사용자의 포인트 충전은 순차적으로 진행되어야 한다.

두번째 : 좌석 예약에 대한 결제 처리 중 사용자의 포인트 차감은 일관화 되게 진행되어야 한다.

-   첫번째 두번째는 서로의 진행이 동시에 발생하게 되면 사용자 포인트의 정합성이 맞지 않을 수 있는 문제가 발생할 수 있으므로 분산락이 아닌 비관적 락을 사용한다.

# 프로젝트회고

-   [서비스 확장에 대한 고찰](https://velog.io/@goodmirow/%EC%84%9C%EB%B9%84%EC%8A%A4-%ED%99%95%EC%9E%A5%EC%97%90-%EB%8C%80%ED%95%9C-%EA%B3%A0%EC%B0%B0)
-   [대기열 성능 테스트와 개선](https://velog.io/@goodmirow/K6%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%9C-%EC%84%B1%EB%8A%A5%ED%85%8C%EC%8A%A4%ED%8A%B8%EC%99%80-%EA%B0%9C%EC%84%A0)
