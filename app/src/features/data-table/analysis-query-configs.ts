import { Analysis, getAnalysis, GetAnalysisRequest, PageOfAnalysis } from 'sap-client';
import { getUrl } from 'service';
import { arrayToNormalizedHashmap } from 'utils';

type AnalysisSlice = {
    analysisTotalCount: number,
    analysisPagingToken: string,
    analysis: { [K: string]: Analysis }
}

// query config for retrieving a page of analysis
export const requestPageOfAnalysis = (params: GetAnalysisRequest) => {
    // use generated api client as base
    var base = getAnalysis<AnalysisSlice>(params);
    // template the full path for the url
    base.url = getUrl(base.url);
    // define a transform for normalizing the data into our desired state
    base.transform = (response: PageOfAnalysis) => {
        return {
            analysisTotalCount: response.totalCount,
            analysisPagingToken: response.pagingToken,
            analysis: response.items ? arrayToNormalizedHashmap(response.items, 'analysisId') : {}
        } as any;
    };
    // define the update strategy for our state
    base.update = {
        analysisTotalCount: (_, newValue) => {
            return newValue;
        },
        analysisPagingToken: (_, newValue) => {
            return newValue;
        },
        analysis: (oldValue, newValue) => {
            return {
                ...oldValue,
                ...newValue
            };
        }
    }
    return base;
}
