import file_none_icon from './file_none.png'
import file_img_icon from './file_img.png'
import file_zip_icon from './file_zip.png'
import file_video_icon from './file_video.png'
import file_mp3_icon from './file_mp3.png'
import file_excel_icon from './file_excel.png'
import file_doc_icon from './file_docx.png'
import file_ppt_icon from './file_ppt.png'
import file_pdf_icon from './file_pdf.png'
import file_txt_icon from './file_txt.png'


// 根据文件类型显示图标
export function handleFileTypeIcon(file_name) {
    let _suffix = file_name.split('.').pop();
    let _path = file_none_icon;
    if (!_suffix) {
        return _path;
    }
    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(_suffix)) {
        // 图片
        _path = file_img_icon;
    } else if (["zip", "rar", "7z", "gz", "tar"].includes(_suffix)) {
        _path = file_zip_icon;
    } else if (
        ["avi", "mp4", "rmvb", "flv", "mov", "m2v", "mkv"].includes(_suffix)
    ) {
        _path = file_video_icon;
    } else if (["mp3", "wav", "wmv", "wma"].includes(_suffix)) {
        _path = file_mp3_icon;
    } else if (["xls", "xlsx"].includes(_suffix)) {
        _path = file_excel_icon;
    } else if (["doc", "docx"].includes(_suffix)) {
        _path = file_doc_icon;
    } else if ("pdf" === _suffix) {
        _path = file_pdf_icon;
    } else if ("ppt" === _suffix) {
        _path = file_ppt_icon;
    } else if ("txt" === _suffix) {
        _path = file_txt_icon;
    } else {
        _path = file_none_icon;
    }
    return _path;
}