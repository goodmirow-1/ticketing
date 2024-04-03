# 14조 김국현 - 티케팅

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
| 유저 토큰 발급 | Get | /user |  | 'token' |
| 예약 가능 날짜 | Get | /reservation/{concertId}/date |  | [{id,date,availableSeats,concert}] |
| 예약 가능 좌석 | Get | /reservation/{concertDateId}/seat |  | [{id,seatNumber,concertDate,status,reservations}] |
| 좌석 예약 요청 | Post | /seat/{seatId} |  | {id,seatNumber,concertDate,status,reservations} |
| 잔액 충전 | Patch | /user | 0 | 0 |
| 잔액 조회 | Get |/user |  | 0 |
| 결제 | Post |/{reservationId}/payment |  | {id,amount,reason,user,reservation,paymentDate} |


## 시퀀스 다이어그램
### 유저 토큰 발급
   
![image](https://github.com/goodmirow-1/ticketing/assets/57578975/cd1e01f7-aae4-4d33-88da-bd3ff83dea9e)


### 예약 가능 날짜 / 좌석 조회
   
![image](https://github.com/goodmirow-1/ticketing/assets/57578975/1341b2e0-da85-4af9-8fe8-c0c1752c8105)

### 좌석 예약

![image](https://github.com/goodmirow-1/ticketing/assets/57578975/17d6dfd2-1db8-4f72-8aa5-203dec3fb594)

### 잔액 조회 / 충전

![image](https://github.com/goodmirow-1/ticketing/assets/57578975/18bc2740-0ae8-4cdf-9278-3a9611a28e91)

### 결제

![image](https://github.com/goodmirow-1/ticketing/assets/57578975/b2b5944a-dcae-4393-b1b4-3cedb2d941e3)


## 엔티티 릴래이션 다이어그램 ( ERD )

![image](https://github.com/goodmirow-1/ticketing/assets/57578975/25bb72cd-d33a-437e-92ab-88e6fb71f9fa)
