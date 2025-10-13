// utils/kakaoMapLoader.ts
declare global {
  interface Window {
    kakao: any;
  }
}

export function loadKakaoMapSdk(appKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // 이미 로드되어 있으면 바로 resolve
    if (window.kakao && window.kakao.maps) {
      return resolve();
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        resolve();
      });
    };
    script.onerror = () => {
      reject(new Error('카카오 지도 SDK 로드 실패'));
    };
    document.head.appendChild(script);
  });
}
