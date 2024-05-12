## 시퀀스 다이어그램
### 유저 토큰 발급
   
![image](https://github.com/goodmirow-1/ticketing/assets/57578975/1ad4dec7-c3b3-45d0-aa4b-1a8a75f89bce)

### 예약 가능 날짜 / 좌석 조회
   
![image](https://github.com/goodmirow-1/ticketing/assets/57578975/1341b2e0-da85-4af9-8fe8-c0c1752c8105)

### 좌석 예약

![image](https://github.com/goodmirow-1/ticketing/assets/57578975/17d6dfd2-1db8-4f72-8aa5-203dec3fb594)

### 잔액 조회 / 충전

![image](https://github.com/goodmirow-1/ticketing/assets/57578975/18bc2740-0ae8-4cdf-9278-3a9611a28e91)

### 결제

![image](https://github.com/goodmirow-1/ticketing/assets/57578975/b2b5944a-dcae-4393-b1b4-3cedb2d941e3)

## 엔티티 릴래이션 다이어그램 ( ERD )

1. concertDate 테이블의 concert를 Index로 설정해서 관계 조회에 대한 성능을 높임
2. Seat 테이블의 concertDateId, status를 Index로 설정해서 콘서트 좌석 조회에 대한 성능을 높임
3. Reservation 테이블의 consertId,consertDateId,seatId 값을 복합 유니크키로 설정해서 낙관적 락을 사용할 수 있게 함

![1](https://github.com/goodmirow-1/ticketing/assets/57578975/eff8f658-b15f-4f1d-9801-b28bf49e03c6)

