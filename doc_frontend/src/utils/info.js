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
    // sessionStorage.removeItem(SITE_INFO_STORAGE_KEY);
    const siteInfoStr = JSON.stringify(siteInfo);
    sessionStorage.setItem(SITE_INFO_STORAGE_KEY, siteInfoStr);
}

export function getBaseSetInfo() {
    let baseSetInfo = sessionStorage.getItem(BASE_SET_INFO_STORAGE_KEY);
    return !isObjEmpty(baseSetInfo) ? JSON.parse(baseSetInfo) : null;
}

export function setBaseSetInfo(baseSetInfo = {}) {
    // sessionStorage.removeItem(BASE_SET_INFO_STORAGE_KEY);
    const baseSetInfoStr = JSON.stringify(baseSetInfo);
    sessionStorage.setItem(BASE_SET_INFO_STORAGE_KEY, baseSetInfoStr);
}



export async function setSiteInfoRequest(reset=false) {
    let siteInfo = getSiteInfo();
    let site_use_help = siteInfo?.site_use_help? siteInfo.site_use_help : null;
    let site_config_help = siteInfo?.site_config_help? siteInfo.site_config_help : null;
    if (!siteInfo || site_use_help === null || !site_config_help  === null || reset) {
        await anonymousSettingSpecifyList()
            .then(res => {
                const results = res.data?.results;
                setSiteInfo(results);
            }, error => {
                console.log(error.response);
            })
    }
}


export async function setBaseSetInfoRequest(reset=false) {
    let baseInfo = getBaseSetInfo();
    if (!baseInfo || reset) {
        await anonymousSettingSpecifyList({'set_classify': 'BaseSet'})
            .then(res => {
                const results = res.data?.results;
                setBaseSetInfo(results);
            }, error => {
                console.log(error.response);
            })
    }
}