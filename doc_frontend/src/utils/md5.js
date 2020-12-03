import SparkMD5 from "spark-md5"

/**
 * 计算文件md5
 * @param file
 * @param chunk_size
 * @param is_chunk_md5
 */
export function computeMD5(file, chunk_size=1024 * 1024, is_chunk_md5=true) {
    return new Promise((resolve)=>{
        let fileReader = new FileReader();
        let blobSlice =
            File.prototype.slice ||
            File.prototype.mozSlice ||
            File.prototype.webkitSlice;
        let currentChunk = 0;  // 当前分块
        let chunks = Math.ceil(file.size / chunk_size);
        let chunks_info = [];
        let spark = new SparkMD5.ArrayBuffer();
        let complete_file_spark = new SparkMD5.ArrayBuffer();
        loadNext();
        fileReader.onload = (e) => {
            spark.append(e.target.result);
            complete_file_spark.append(e.target.result);
            if (currentChunk < chunks) {
                // 每一个分片需要包含的信息
                const chunk_item = {
                    chunk_file: e.target.result,
                    chunk_index: currentChunk + 1,
                }
                if (is_chunk_md5){
                    chunk_item['chunk_md5'] = spark.end();
                }
                console.log('chunk_item', chunk_item);
                chunks_info.push(chunk_item)
                currentChunk++;
                loadNext();
            } else {
                let file_md5 = complete_file_spark.end();
                resolve({'file_name': file.name, 'file_md5': file_md5, 'chunks_info': chunks_info, 'chunks_num': chunks});
            }
        };

        fileReader.onerror = function () {
            file.abort();
        };

        function loadNext() {
            let start = currentChunk * chunk_size;
            let end =
                start + chunk_size >= file.size ? file.size : start + chunk_size;
            fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
        }
    });
}


export function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}