import 'jest';
import {createHistogram} from '../../services/timeseries'
import 'assert'
import {timestamps} from './data-timestamps'

describe('API claim issuance scenario', async () => {
    it('should create histogram', async () => {
        const timestamps = [1,1,1,2,2,3,3,8,10]
        const histogram = await createHistogram(timestamps, 3);
        expect(histogram[0][0]).toBe(1);
        expect(histogram[0][1]).toBe(7);

        expect(histogram[1][0]).toBe(4);
        expect(histogram[1][1]).toBe(0);

        expect(histogram[2][0]).toBe(7);
        expect(histogram[2][1]).toBe(1);
    });

    it('should work with small bucketsize', async () => {
        const timestamps = [1,3]
        const histogram = await createHistogram(timestamps, 1);
        expect(histogram[0][0]).toBe(1);
        expect(histogram[0][1]).toBe(1);

        expect(histogram[1][0]).toBe(2);
        expect(histogram[1][1]).toBe(0);

        expect(histogram[2][0]).toBe(3);
        expect(histogram[2][1]).toBe(1);
    });

    it('should handle small dataset', async () => {
        const timestamps = [1]
        const histogram = await createHistogram(timestamps, 3);
        expect(histogram[0][0]).toBe(1);
        expect(histogram[0][1]).toBe(1);
    });

    it('should not fail on big dataset', async () => {
        const intervalSec = 60*60*24;
        const histogram = await createHistogram(timestamps, intervalSec);
        console.log(histogram)
    });



})

