
/*--------------------------------------------------------------------------------------------------------
 * Copyright (c) Sagene Corporation. All rights reserved.
 * Licensed under the CC BY-NC-ND 4.0 License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------------------*/

// params
// 参数配置

// 图片库
const pics = {
    "封面": "https://sagene-i-cloud.s3.cn-north-1.amazonaws.com.cn/data/private/report_template/pcr_cover.jpg",
    "背景": "https://sagene-i-cloud.s3.cn-north-1.amazonaws.com.cn/data/private/report_template/images/background.jpg",
    "封底": "https://sagene-i-cloud.s3.cn-north-1.amazonaws.com.cn/data/private/report_template/images/back_cover.jpg",
}

// 字体库
const fonts = {
    "思源黑体": ["source_han_sans",
        "https://sagene-i-cloud.s3.cn-north-1.amazonaws.com.cn/data/private/report_template/fonts/SourceHanSans.ttf"],
    "Times New Roman italic": ["Times New Roman italic",
        "https://sagene-i-cloud.s3.cn-north-1.amazonaws.com.cn/data/private/report_template/fonts/Times+New+Roman+Italic.ttf"]
}

// 信息库
const species = "土曲霉"
const latin = "Aspergillus terreus"
const diagnosis = report['verification_result']
const intro = "曲霉属在分类学中属子囊菌门、发菌科，曲霉广泛存在于自然界，属于环境腐生菌。曲霉能释放真菌毒素或其他代谢产物导致疾病，也可直接在创伤皮肤、眼睛或其他部位繁殖，或因吸入孢子造成过敏或侵袭性疾病，曲霉最常侵袭肺部，也可因初次感染后持续扩散或播散到几乎所有的器官。曲霉也可分离于呼吸道以外的其他部位，比如鼻窦、脑脊液、皮肤、其他组织、眼和心脏瓣膜。烟曲霉是侵袭性曲霉病最主要的病原菌，其他致病真菌种类包括黄曲霉、土曲霉、黑曲霉，以及不常见的构巢曲霉和焦曲霉。"


// 内容集
const project = "迅益准®高灵敏病原微生物PCR检测报告"
const Infos = {
    "患者姓名": report['sample_info']['patient_name'] || '-',
    "送检单位": report['sample_info']["inspection_company"] || '-',
    "送检样本": report['sample_info']["sample_type"] || '-',
    "送检编号": report['sample_info']["sample_name"] || '-',
    "报告编号": report['sample_info']["serial_number"] || '-',
    "报告日期": report['sample_info']["submit_time"] || '-',
    "性别": report['sample_info']["patient_gender"] || '-',
    "年龄": report['sample_info']["patient_age"] || '-',
    "住院号": report['sample_info']["hospital_number"] || "-",
    "床位号": report['sample_info']["bed_number"] || "-",
    "联系方式": report['sample_info']["patient_phone"] || '-',
    "样本来源": report['sample_info']["inspection_department"] || '-',
    "送检医生": report['sample_info']["inspection_doctor"] || '-',
    "采样时间": report['sample_info']["sampling_time"] || '-',
    "收样时间": report['sample_info']["collection_time"] || '-',
    "临床诊断": report['sample_info']["clinical_diagnosis"] || '-'
}
const words = {
    "页眉": "报告编号：" + Infos["报告编号"],
    "页脚": "本报告仅供专业的研究人员及临床医生参考，不作为临床确诊的唯一依据。",
}

const result = [
    ["样本编号", "检测结果", "检测病原体名称", "拉丁文"],
    [Infos["报告编号"], diagnosis, species, <Text style={{ fontFamily: "Times New Roman italic" }}>{latin}</Text>]
]

// View
// 文档结构
const PCR = () => (
    <Document>
        {/* 封面，由封面图和样本信息组成 */}
        <Page title="封面" style={{position: "relative"}}>
            <Image allowDangerousPaths={true} src={ pics["封面"] } style={styles.img}></Image>
            { Object.keys(titles).map((item, index) => (
                <Text key={index} style={[styles.titleKey, { top: String(55 + 4 * index) + "%" }]}>{item}</Text>
            )) }
            { Object.keys(titles).map((item, index) => (
                <Text key={index} style={[styles.title, { top: String(55 + 4 * index) + "%" }]}>{titles[item]}</Text>
            )) }
        </Page>

        {/* 正文，文档核心部分，由不同章节构成 */}
        <Page title="正文" style={styles.layout}>
            {/* 背景，含水印 */}
            <Watermark fixed>
                <Image allowDangerousPaths={true} src={ pics["背景"] }></Image>
            </Watermark>

            {/* 页眉，含页码 */}
            <Header style={{ textAlign: "center" }} fixed>{ project }</Header>
            <Header fixed>{ words["页眉"] }</Header>
            <Pagination render={( {pageNumber, totalPages} ) => `当前第${pageNumber - 1}页/共${totalPages}页`} fixed></Pagination>

            <Section title="基本信息">
                <Headline1>1. 基本信息</Headline1>
                {/* 表单 */}
                <CustomTable
                    style={{ textAlign: "center", paddingTop: "9px", padddingBottom: "7px" }}
                    data={ ["受检者信息"] } hasTop={true} backgroundColor="#CCEBED"
                ></CustomTable>
                {
                    clientsGroup.map((items, index) => {
                        if (items.length == 4) {
                            return(
                                <CustomTable
                                    key={index} style={{ paddingTop: "9px", padddingBottom: "7px", paddingLeft: "5px" }} data={items}
                                    weight={[0.2, 0.3, 0.2, 0.3]} backgroundColor={["#ecf8f8", "white", "#ecf8f8", "white"]}
                                ></CustomTable>
                            )
                        } else {
                            return (
                                <CustomTable
                                    key={index} style={{ paddingTop: "9px", padddingBottom: "7px", paddingLeft: "5px", textAlign: "center" }} data={items}
                                    weight={[0.2, 0.8]} backgroundColor={["#ecf8f8", "white"]}
                                ></CustomTable>
                            )
                        }
                    })
                }
            </Section>

            <Section break>
                <Headline1>2. 项目简介</Headline1>
                <ParagraphNoIndent>该项目使用自主研发的迅益准®高灵敏病原微生物PCR技术检测{species}（<Text style={{ fontFamily: "Times New Roman italic" }}>{latin}</Text>）。该技术以PCR技术为核心，具有灵敏度高，特异性强的特点。其主要内容如下：</ParagraphNoIndent>
                <RowIndent>1) 引物设计与合成</RowIndent>
                <RowIndent>通过分析GenBank公布的{species}的基因序列信息合成引物。</RowIndent>
                <RowIndent>2）实验主要试剂</RowIndent>
                <RowIndent>核酸提取或纯化试剂盒（粤穗械备20180539号），迅益准®PCR扩增试剂盒。</RowIndent>
                <RowIndent>3）主要实验仪器</RowIndent>
                <RowIndent>PCR仪：型号GE4852T（柏恒）</RowIndent>
                <RowIndent>核酸电泳仪：型号JS-power 300（上海培清公司）</RowIndent>
                <RowIndent>凝胶成像分析仪：型号JS-860B（上海培清公司）</RowIndent>
            </Section>

            <Section break>
                <Headline1>3. 检测结果</Headline1>
                <Row>本项目可用于鉴定待测样本中的{species}，以辅助临床进行诊断。</Row>
                <CustomTable
                    style={{ paddingVertical: "8px", paddingLeft: "5px", textAlign: "center" }} data={result[0]}
                    weight={[0.2, 0.2, 0.3, 0.3]} backgroundColor="#ecf8f8" hasTop={true}
                ></CustomTable>
                <CustomTable
                    style={{ paddingVertical: "8px", paddingLeft: "5px", textAlign: "center" }} data={result[1]}
                    weight={[0.2, 0.2, 0.3, 0.3]} backgroundColor="white"
                ></CustomTable>
                <Row style={{ marginTop: "10px" }}>说明：</Row>
                <Row>（1）本报告检测结果仅对本次送检样品负责。如有疑义，请于收到本报告起10个工作日内与我们取得联系。</Row>
                <Row>（2）以上检测结果仅供临床参考，不代表最终诊断意见。本公司对以上检测结果保留最终解释权。</Row>
            </Section>

            <Section>
                <Headline1>4. 病原体背景</Headline1>
                <Paragraph>{intro}</Paragraph>
            </Section>

            <Section break>
                <Headline1>5. 参考文献</Headline1>
                <RowIndent>[1] NCBI:（fp://fp.ncbi nlm.nih.gov/genomes/）</RowIndent>
                <RowIndent>[2] Ensemble Database（http://ensemblgenomes.org/）</RowIndent>
                <RowIndent>[3] The proprietary pathogenic microbial database of Guangzhou Sagene Biotech Co., Ltd</RowIndent>
                <RowIndent>[4] Miao Q, et al. Microbiological Diagnostic Performance of Metagenomic Next-generation Sequencing When Applied to Clinical Practice. Clin Infect Dis. 2018 Nov 13;67(suppl_2): S231-S240.</RowIndent>
                <RowIndent>[5] Priyadarshini P, et al. Evaluation of highly conserved hsp65-specific nested PCR primers for diagnosing Mycobacterium tuberculosis. Int J Tuberc Lung Dis. 2017 Feb 1; 21(2): 214-217.</RowIndent>
                <RowIndent>[6] 王辉，马筱玲，钱渊等主译的《临床微生物学手册（第11版）》</RowIndent>
            </Section>

            <Section>
                <Headline1>6. 声明</Headline1>
                <Paragraph>该项目使用迅益准®高灵敏病原微生物PCR检测技术鉴定目标病原体，具有灵敏度高，特异性强，且快速的特点。</Paragraph>
                <Paragraph>本技术的检测结果可能受到样本采集的影响，建议选取感染部位采集样本，采样需严格按照标准采样流程进行样本采集，并严格控制保存运输的温度。</Paragraph>
                <Paragraph>本检测出现假阴性结果的原因包含但不限于：①样本中病原体浓度低于检测下限；②病原体基因组序列未被数据库收录。</Paragraph>
                <Paragraph>本报告所示检测结果仅用于协助临床医师进行病原体鉴定与用药判断，不作为最终诊断结果。</Paragraph>
            </Section>

            {/* 页脚 */}
            <Footer fixed>{ words["页脚"] }</Footer>
        </Page>

        <Page title="封底">
            <Image allowDangerousPaths={true} src={ pics["封底"] } style={styles.img}></Image>
        </Page>
    </Document>
)

// component
// 可重用组件

/**
 *  自定义表格组件，用于表格中一行的渲染，文档内所有表格的基础
 *
 *  @prop data 每一行的数据列表，当数据项为字符串时直接渲染，为子数组时将数组拆分以不同策略渲染（用于物种中英文名单元格）
 *  @prop weight 单元格的权重列表，即宽度占比，列表中权重总和为1
 *  @prop border 边框属性，默认值为1pt solid #14938C
 *  @prop backgroundColor 单元格背景颜色，如果值为字符串则被整行采用，如果值为列表，则不同单元格分别上色，缺省值为白色
 *  @prop hasTop 是否渲染上部边框，一般单元格的标题行应该渲染，非标题行不用渲染
 *  @prop style 用于单元格的额外样式
 */
const CustomTable = (props) => {
    const data = props.data;
    const length = data.length;
    const weight = props.weight || new Array(length).fill(1 / length)
    const border = props.border || "1pt solid #14938C";
    const backgroundColor = Object.prototype.toString.call(props.backgroundColor) === "[object String]" ?
        new Array(length).fill(props.backgroundColor) :
        props.backgroundColor ||  new Array(length).fill("white")
    const hasTop = props.hasTop;
    const borderTop = hasTop ? border : "0"
    const style = props.style

    // 前n-1个单元格
    const items = data.slice(0, -1).map((item, index) => (
            Object.prototype.toString.call(item) === "[object String]" ? (
                <View key={index} style={[
                    {width: weight[index] * 100 + "%", fontFamily: "source_han_sans", borderRight: `${border}`, backgroundColor: `${backgroundColor[index]}`},
                    style
                ]}>
                    <Text>{item}</Text>
                </View>
            ) : (
                <SpeciesName key={index} style={[
                    {width: weight[index] * 100 + "%", borderRight: `${border}`}
                ]}>
                    <Text style={{ marginBottom: "8px" }}>{item[0]}</Text>
                    <Text style={{ fontFamily: "Arial" }}>{item[1]}</Text>
                </SpeciesName>
            )
        )
    )

    // 最后一个单元格
    const lastOne = <View style={[
        {width: weight.slice(-1) * 100 + "%", fontFamily: "source_han_sans", backgroundColor: `${backgroundColor.slice(-1)}`},
        style
    ]}>
        <Text>{data.slice(-1)}</Text>
    </View>

    // 一行表格的视图
    return (
        <View style={[
            { width: "500px",  border: `${border}`, display: "flex", flexDirection: "row", justifyContent: "space-around" },
            { borderTop: `${borderTop}` }
        ]}>
            {items}
            {lastOne}
        </View>
    )
}

// 封面所需样本信息汇总
const titles = {
    "患者姓名：": Infos["患者姓名"],
    "送检单位：": Infos["送检单位"],
    "送检编号：": Infos["送检编号"],
    "报告编号：": Infos["报告编号"],
    "报告日期：": Infos["报告日期"],
}

// 样本信息表所需信息汇总
const clients = []
const clientsInfoItem = ["患者姓名", "性别", "年龄", "联系方式", "住院号", "床位号",
    "送检样本", "报告编号", "样本来源", "送检医生", "采样时间",
    "收样时间"]
clientsInfoItem.forEach(item => clients.push([item == "患者姓名" ? "姓名" : item == "报告编号" ? "样本编号" : item, Infos[item]]))
const clientsGroup = []
for (var i=0, len=clients.length; i<len; i+=2) {
    clientsGroup.push(clients[i].concat(clients[i+1]))
}
clientsGroup.push(["临床诊断", Infos["临床诊断"]])
clientsGroup.push(["检测项目", project])
clientsGroup.push(["检测病原", species])


// Style
// 样式布局

// 字体载入
Object.keys(fonts).forEach(item => Font.register({ family: fonts[item][0], src: fonts[item][1] }))
// Font.register({ family: fonts["思源黑体"][0], src: fonts["思源黑体"][1] })

// 中文断字
Font.registerHyphenationCallback(
    word => word.length === 1 ? [word] : Array.from(word).map(
        (char) => [char, '']).reduce((arr, current) => {arr.push(...current); return arr}, []
    )
);

// 样式组件
// 章节
const Section = styled.View`
  margin-bottom: 50px;
`

// 一号标题
const Headline1 = styled.Text`
  font-size: 16px;
  width: 500px;
  height: 40px;
  color: whitesmoke;
  background-color: #01ADB7;
  padding-top: 12px;
  padding-left: 10px;
  margin-bottom: 5px;
  font-family: source_han_sans;
`

// 二号标题
const Headline2 = styled.Text`
  margin-top: 30px;
  margin-bottom: 8px;
  font-size: 12px;
`

// 页眉
const Header = styled.Text`
  position: absolute;
  top: 20px;
  left: 50px;
  width: 500px;
  height: 30px;
  border-bottom-width: 1px;
  border-style: solid;
  border-color: #C3E6E8;
  padding-top: 10.5px;
  font-family: source_han_sans;
  font-size: 9px;
  text-align: right;
`

// 页脚
const Footer = styled.Text`
  position: absolute;
  bottom: 35px;
  left: 50px;
  width: 500px;
  height: 15px;
  text-align: center;
  font-family: source_han_sans;
  font-size: 9px;
`

// 页码
const Pagination = styled.Text`
  position: absolute;
  bottom: 15px;
  left: 50px;
  width: 500px;
  height: 15px;
  text-align: center;
  font-family: source_han_sans;
  font-size: 9px;
`

// 水印
const Watermark = styled.View`
  position: absolute;
  top: 70px;
  bottom: 70px;
  left: 50px;
`

// 文字行
const Row = styled.Text`
  line-height: 2pt;
  font-size: 12px;
  font-family: source_han_sans;
`
const RowIndent = styled.Text`
  line-height: 2pt;
  font-size: 12px;
  padding-left: 23px;
  font-family: source_han_sans;
`

const Paragraph = styled.Text`
  padding-left: 23px;
  padding-right: 23px;
  line-height: 2pt;
  text-indent: 23px;
  font-size: 12px;
  font-family: source_han_sans;
`

const ParagraphNoIndent = styled.Text`
  line-height: 2pt;
  text-indent: 23px;
  font-size: 12px;
  font-family: source_han_sans;
`

// 样式表
const styles = StyleSheet.create({
    layout: {
        position: "absolute",
        paddingTop: 70,
        paddingBottom: 50,
        paddingHorizontal: 50,
        fontSize: 12,
        fontFamily: "source_han_sans"
    },
    title: {
        position: "absolute",
        left: "20%",
        width: "8cm",
        paddingLeft: "20px",
        borderBottomWidth: "1pt",
        borderStyle: "solid",
        borderColor: "#008F98",
        fontFamily: "source_han_sans",
        fontSize: "12pt",
        color: "#008F98"
    },
    titleKey: {
        position: "absolute",
        left: "10%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "source_han_sans",
        fontSize: "12pt",
        color: "#008F98"
    },
    img: {
        height: "100%",
        width: "100%",
    }
})

// 启动渲染
ReactPDF.render(<PCR />)
