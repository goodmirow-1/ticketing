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