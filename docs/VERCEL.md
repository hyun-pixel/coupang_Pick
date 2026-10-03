# Vercel 배포 안내

2026-10-02 기준. 이 프로젝트는 표준 Next.js 앱입니다. 사이트 공개는 사용자가 직접 진행합니다.

## 1. 방문자 페이지부터 배포

수정 소스가 GitHub에 반영된 뒤 진행하세요. 기존 실패한 커밋을 다시 배포하면 같은 오류가 납니다.

1. Vercel에서 **coupang-pick → Settings → Build and Deployment**를 엽니다.
2. **Framework Preset**은 **Next.js**, **Root Directory**는 저장소 루트(`./`)로 설정합니다. GitHub에는 요즘픽 폴더의 내용이 루트에 올라갑니다.
3. 기존 Build / Output / Install Command의 별도 Override는 해제합니다. 저장소의 `vercel.json`이 `npm run build`와 `.next`를 지정합니다. 직접 설정한다면 Install Command는 `npm ci`입니다.
4. **Node.js Version**은 **24.x**로 설정합니다.
5. GitHub 기본 브랜치 `fix/partners-compliance`의 최신 커밋을 배포합니다. Vercel 전환 작업도 이 브랜치에 모아 관리합니다. Vercel 프로젝트의 운영 브랜치가 `fix/partners-compliance`로 지정되어 있는지 확인하세요.
6. 빌드 로그에 `next build --webpack`이 표시되는지 확인합니다. `vinext build`가 보이면 이전 소스를 배포한 것입니다.
7. 배포 주소에서 홈, 검색, 상품 상세, 쿠팡 버튼을 확인합니다.

환경변수 없이도 상품 18개와 사진 공란으로 방문자 페이지가 작동합니다. 이 상태의 `/admin`에는 운영자 설정 안내가 표시됩니다. 로컬 개발용 로그인이 공개 서버에서 열리지는 않습니다.

## 2. 온라인 관리자 편집 연결

상품을 웹에서 저장하려면 Vercel 서버 밖의 영구 저장소와 운영자 로그인이 필요합니다. 준비된 연결은 Supabase입니다. 이번 작업에서는 외부 프로젝트 생성, 요금제 신청, 기존 프로젝트 변경을 하지 않았습니다. 전용 프로젝트를 준비할 때 계정의 무료 프로젝트 한도와 요금제를 먼저 확인하세요.

1. 요즘픽 전용 Supabase 프로젝트를 준비합니다. 다른 서비스의 운영 프로젝트는 사용하지 마세요.
2. Supabase의 **SQL Editor → New query**에서 이 저장소의 `db/supabase-setup.sql` 내용을 실행합니다. 삭제 명령은 없으며 `yojeumpick_content` 테이블과 제한된 접근 권한을 만듭니다.
3. **Authentication → Users → Add user → Create new user**에서 본인 이메일과 비밀번호로 운영자를 생성합니다. 이메일 초대 발송은 필요하지 않습니다. 로그인할 수 있는 확인 완료 계정으로 생성하고 사용자 **UID**를 복사합니다.
4. 프로젝트의 **Connect** 또는 **Settings → API Keys**에서 Project URL, Publishable key, Secret key를 확인합니다.
5. Vercel **coupang-pick → Settings → Environment Variables**에 아래 네 값을 등록합니다. 실제 사용할 배포 환경(Production 등)에 모두 동일한 프로젝트 값으로 등록합니다.

| 이름 | 값 |
| --- | --- |
| `SUPABASE_URL` | Supabase 프로젝트 주소 |
| `SUPABASE_PUBLISHABLE_KEY` | 해당 프로젝트의 Publishable key |
| `SUPABASE_SECRET_KEY` | 해당 프로젝트의 Secret key, 서버에서만 사용 |
| `ADMIN_USER_ID` | 위에서 만든 운영자의 UID |

6. 환경변수 등록 후 수정된 배포를 **Redeploy**합니다. 일부 변수만 입력한 채 배포하지 마세요. 잘못 연결된 저장소 오류를 숨기지 않으므로 불완전한 설정은 페이지 오류로 표시됩니다.
7. 사이트 `/admin`에서 이메일·비밀번호로 로그인합니다. **초안 저장 → 미리보기 → 사이트에 반영** 순서로 확인합니다. 저장만 하면 공개 화면은 바뀌지 않습니다.

비밀키는 채팅, GitHub, 클라이언트 코드에 넣지 마세요. `NEXT_PUBLIC_` 접두어도 붙이지 않습니다. 서버에서 실제 로그인 사용자를 확인하고 `ADMIN_USER_ID`와 일치할 때만 편집을 허용합니다. 데이터 테이블은 RLS를 켜고 익명·일반 사용자 직접 접근을 차단합니다.

새 테이블이 비어 있으면 기본 상품을 보여주며 첫 저장 때 기본 공개본과 초안을 기록합니다. 현재 이전 로컬 저장 내용과 기본 상품 데이터가 동일한 것을 확인했습니다. 이후 이 컴퓨터에서 편집한 내용이 온라인 저장소로 자동 동기화되지는 않습니다.

## 3. 로컬 작업과 보존

- `start-preview.cmd` 또는 `npm run dev`: http://127.0.0.1:5173/
- 환경변수를 넣지 않은 개발 실행에서는 로컬 체험 로그인과 `.local/content.sqlite`를 사용합니다.
- 기존 `.wrangler/state`의 데이터는 `.local/content.sqlite`로 복사했고 원본도 보존했습니다.
- `.local`, `.wrangler`, `.env*`, `preview`는 Git에서 제외합니다. 저장소 파일은 Next.js 배포 추적에서도 제외합니다.
- 로컬에서 Supabase 연결을 시험할 때는 네 환경변수를 `.env.local`에 설정합니다. 운영 DB에 연결하면 로컬에서 누른 ‘사이트에 반영’도 실제 공개 내용에 적용되므로 별도 테스트 프로젝트를 사용하세요.

## 4. 검증 범위와 남은 연결

Next.js 배포용 빌드, TypeScript, 상품 규칙·로컬 저장·개발 로그인 차단 테스트를 실행했습니다. 실제 Vercel 배포와 실제 Supabase 계정의 온라인 연결은 아직 실행하지 않았습니다. 외부 계정을 연결한 뒤 최종 로그인·저장 확인이 필요합니다.

공식 문서: [Vercel의 Next.js 지원](https://vercel.com/docs/frameworks/full-stack/nextjs), [Vercel 프로젝트 설정](https://vercel.com/docs/project-configuration/vercel-json), [Supabase 서버 인증](https://supabase.com/docs/guides/auth/server-side/creating-a-client).
