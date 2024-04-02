# 14조 김국현 - 티케팅

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
## API 설명
유저 토큰 발급 API
JWT와 UserInspector를 활용하여 유저의 UUID와 대기열 정보를 기반으로 토큰을 발급합니다.
예약 가능 날짜 / 좌석 조회 API
Redis의 pub/sub을 이용한 대기열 기능을 통해 예약 가능한 좌석 정보를 제공합니다.
좌석 예약 요청 API
사용자는 날짜와 좌석 정보를 입력하여 예약을 요청할 수 있습니다.
예약 시 비관적 락을 적용하여 동시성을 제어합니다.
잔액 충전 / 조회 API
사용자는 자신의 잔액을 충전하거나 조회할 수 있습니다.
결제 API
사용자는 충분한 잔액을 가지고 있어야 결제를 진행할 수 있습니다.

## 시퀀스 다이어그램
### 예약 가능 날짜 및 해당 날짜 조회
   
![image](https://github.com/goodmirow-1/ticketing/assets/57578975/fbe0210a-5c0d-4a87-bea6-7410d0807b84)

### 좌석 예약 및 결제
   
![image](https://github.com/goodmirow-1/ticketing/assets/57578975/30c5317b-811b-4135-8595-2466ab30101a)

