# Concert Ticketing Server

TDD 기반 콘서트 티케팅 서버 구축 프로젝트 입니다.

# 목차

-   [요약](#요약)
-   [기술 스택](#기술-스택)
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
    -   [아키텍처 개선을 통한 도메인 보호 및 유지보수성 향상](#아키텍처-개선을-통한-도메인-보호-및-유지보수성-향상)
    -   [동시성 문제와 극복](https://velog.io/@goodmirow/7%EC%A3%BC%EC%B0%A8-%EB%8F%99%EC%8B%9C%EC%84%B1-%EB%AC%B8%EC%A0%9C%EC%99%80-%EA%B7%B9%EB%B3%B5)
    -   [DB Index설정과 캐싱](https://velog.io/@goodmirow/8%EC%A3%BC%EC%B0%A8-%EC%A0%81%EC%9D%80-%EB%B6%80%ED%95%98%EB%A1%9C-%ED%8A%B8%EB%9E%98%ED%94%BD-%EC%B2%98%EB%A6%AC%ED%95%98%EA%B8%B0)
    -   [서비스 확장에 대한 고찰](https://velog.io/@goodmirow/%EC%84%9C%EB%B9%84%EC%8A%A4-%ED%99%95%EC%9E%A5%EC%97%90-%EB%8C%80%ED%95%9C-%EA%B3%A0%EC%B0%B0)
    -   [대기열 성능 테스트와 개선](https://velog.io/@goodmirow/K6%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%9C-%EC%84%B1%EB%8A%A5%ED%85%8C%EC%8A%A4%ED%8A%B8%EC%99%80-%EA%B0%9C%EC%84%A0)

# 요약

-   콘서트 예약 서비스를 구현합니다.
-   대기열 시스템을 구축하고, 예약 서비스는 작업가능한 유저만 수행할 수 있도록 해야합니다.
-   좌석 예약 요청시에, 결제가 이루어지지 않더라도 일정 시간동안 다른 유저가 해당 좌석에 접근할 수 없도록 합니다.

# 기술 스택

- NestJS, TypeORM, MariaDB, Typescript
- TDD, Clean Architecture, Redis, Kafka, Event, Docker, CI/CD

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

## 아키텍처 개선을 통한 도메인 보호 및 유지보수성 향상

### 기존 아키텍처의 문제점

기존의 단일 레이어드 아키텍처는 상위 계층이 하위 계층에 의존하는 단방향 흐름을 가지고 있었습니다. 이로 인해 하위 계층의 변경이 상위 계층에 영향을 주는 문제가 발생하여 유지보수가 어려웠습니다.

### 개선된 아키텍처

**계층 구조:**

- **API (Presentation):** 외부와의 소통을 담당하며, 컨트롤러, 모듈 등을 포함합니다.
- **Application (Business):** 도메인 서비스들을 조합하여 사용자의 요구사항(use case)을 처리하는 로직을 구현합니다.
- **Domain (Abstract):** 핵심 비즈니스 로직을 캡슐화하며, 모델과 Repository 인터페이스를 정의합니다.
- **Infrastructure (Persistence):** 데이터베이스와의 통신 및 데이터 처리를 담당하며, 엔티티와 Repository 구현체를 포함합니다.

**도메인 모델 구성:**

- **Concert:** 콘서트, 콘서트 날짜, 좌석, 예약 등 콘서트 관련 엔티티를 포함합니다.
- **User:** 사용자, 포인트 내역 등 사용자 관련 엔티티를 포함합니다.

**도메인 순수성 확보:**

- **Application Join:** 서로 다른 도메인 간의 연관 관계는 데이터베이스 조인이 아닌 애플리케이션 레벨에서 처리하여 도메인 모델의 순수성을 유지합니다.

### 추가 개선 방안

- **Reservation 도메인 분리:** 콘서트 도메인의 책임 분리를 위해 예약 및 결제 관련 기능을 별도의 도메인으로 분리하여 관리할 수 있습니다.

### 기대 효과

이러한 아키텍처 개선을 통해 다음과 같은 효과를 기대할 수 있습니다.

- **도메인 모델의 명확성 및 응집도 향상:** 각 도메인이 핵심 비즈니스 로직에 집중하여 코드의 가독성과 유지보수성을 높입니다.
- **유연성 및 확장성 증대:** 계층 간의 느슨한 결합으로 인해 특정 계층의 변경이 다른 계층에 미치는 영향을 최소화하여 시스템의 유연성과 확장성을 향상시킵니다.
- **테스트 용이성 확보:** 각 계층을 독립적으로 테스트할 수 있도록 하여 테스트 효율성을 높이고 버그 발생 가능성을 줄입니다.

