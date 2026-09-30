const JS_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
const SDK_SRC = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';

type KakaoSDK = {
  isInitialized: () => boolean;
  init: (key: string) => void;
  Share: { sendDefault: (settings: unknown) => void };
};

declare global {
  interface Window {
    Kakao?: KakaoSDK;
  }
}

let loading: Promise<KakaoSDK | null> | null = null;

function ensureKakao(): Promise<KakaoSDK | null> {
  if (!JS_KEY || typeof window === 'undefined') return Promise.resolve(null);
  if (window.Kakao?.isInitialized()) return Promise.resolve(window.Kakao);
  if (loading) return loading;

  loading = new Promise((resolve) => {
    const init = () => {
      const K = window.Kakao;
      if (K && !K.isInitialized()) K.init(JS_KEY);
      resolve(K ?? null);
    };
    if (window.Kakao) return init();
    const script = document.createElement('script');
    script.src = SDK_SRC;
    script.crossOrigin = 'anonymous';
    script.onload = init;
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
  return loading;
}

/** 카카오톡 공유. SDK 사용 불가 시 false 반환(호출부에서 폴백). */
export async function shareToKakao(opts: {
  url: string;
  title: string;
  description: string;
}): Promise<boolean> {
  const K = await ensureKakao();
  if (!K) return false;
  try {
    K.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: opts.title,
        description: opts.description,
        imageUrl: `${window.location.origin}/opengraph-image`,
        link: { mobileWebUrl: opts.url, webUrl: opts.url },
      },
      buttons: [
        {
          title: '중간지점 보기',
          link: { mobileWebUrl: opts.url, webUrl: opts.url },
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
}
