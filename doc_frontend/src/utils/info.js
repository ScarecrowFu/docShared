import {isObjEmpty} from "./index";
import {anonymousSettingSpecifyList} from "src/apis/sys_set";
import {BaseSetInfoKey, SiteInfoKey} from "src/config/settings";
const SITE_INFO_STORAGE_KEY = SiteInfoKey;
const BASE_SET_INFO_STORAGE_KEY = BaseSetInfoKey;

export function getSiteInfo() {
    let siteInfo = sessionStorage.getItem(SITE_INFO_STORAGE_KEY);
    return !isObjEmpty(siteInfo) ? JSON.parse(siteInfo) : null;
}

export function setSiteInfo(siteInfo = {}) {
    const siteInfoStr = JSON.stringify(siteInfo);
    sessionStorage.setItem(SITE_INFO_STORAGE_KEY, siteInfoStr);
}

export function getBaseSetInfo() {
    let baseSetInfo = sessionStorage.getItem(BASE_SET_INFO_STORAGE_KEY);
    return !isObjEmpty(baseSetInfo) ? JSON.parse(baseSetInfo) : null;
}

export function setBaseSetInfo(baseSetInfo = {}) {
    const baseSetInfoStr = JSON.stringify(baseSetInfo);
    sessionStorage.setItem(BASE_SET_INFO_STORAGE_KEY, baseSetInfoStr);
}



export async function setSiteInfoRequest() {
    let siteInfo = getSiteInfo();
    let site_use_help = siteInfo?.site_use_help? siteInfo.site_use_help : null
    let site_config_help = siteInfo?.site_config_help? siteInfo.site_config_help : null
    if (site_use_help === null || !site_config_help  === null) {
        await anonymousSettingSpecifyList()
            .then(res => {
                const results = res.data?.results;
                setSiteInfo(results);
            }, error => {
                console.log(error.response);
            })
    }
}