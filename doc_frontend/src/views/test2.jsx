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