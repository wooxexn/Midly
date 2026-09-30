import { GeoService } from './geo.service';
import type { KakaoClient, KakaoPlace } from '../external/kakao.client';

const samplePlace: KakaoPlace = {
  id: '1',
  place_name: '강남역',
  category_group_code: 'SW8',
  category_name: '교통,수송 > 지하철,전철',
  x: '127.027926',
  y: '37.497175',
  place_url: 'http://place.map.kakao.com/1',
  address_name: '서울 강남구 역삼동',
  road_address_name: '서울 강남구 강남대로 지하 396',
};

describe('GeoService.search', () => {
  let kakao: { searchKeyword: jest.Mock };
  let service: GeoService;

  beforeEach(() => {
    kakao = { searchKeyword: jest.fn() };
    service = new GeoService(kakao as unknown as KakaoClient);
  });

  it('빈 쿼리는 검색하지 않고 빈 배열을 반환한다', async () => {
    expect(await service.search('   ')).toEqual([]);
    expect(kakao.searchKeyword).not.toHaveBeenCalled();
  });

  it('Kakao 결과를 GeoSearchResult로 매핑한다 (도로명 주소 우선, 좌표 숫자 변환)', async () => {
    kakao.searchKeyword.mockResolvedValue([samplePlace]);

    const results = await service.search('강남역');

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      name: '강남역',
      address: '서울 강남구 강남대로 지하 396',
      lat: 37.497175,
      lng: 127.027926,
    });
  });

  it('도로명 주소가 없으면 지번 주소를 사용한다', async () => {
    kakao.searchKeyword.mockResolvedValue([
      { ...samplePlace, road_address_name: '' },
    ]);
    const results = await service.search('강남역');
    expect(results[0].address).toBe('서울 강남구 역삼동');
  });
});
