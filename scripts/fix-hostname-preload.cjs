// vercel CLI가 Windows os.hostname()(컴퓨터 이름 "이성완")을 어딘가에서 HTTP 헤더 값으로
// 그대로 쓰다가 "Cannot convert argument to a ByteString" 에러를 던지는 문제 우회용.
// Windows 컴퓨터 이름 자체를 바꾸는 대신, 이 프로세스 안에서만 os.hostname()이
// ASCII 값을 반환하도록 패치한다. `node -r ./scripts/fix-hostname-preload.cjs ...`로 사용.
const os = require("os");
os.hostname = () => "moneylog-deploy";
