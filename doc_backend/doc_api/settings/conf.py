CollectedDocPermissions = {
    10: '公开',
    20: '私密',
    30: '成员可见',
    40: '访问码可见',
}

CollectedDocMembersPermissions = {
    10: '普通成员',  # 新建/修改/删除个人文档
    20: '高级成员',  # 新建/修改文集内所有文档+删除个人文档
    30: '文集管理员',  # 新建/修改/删除文集文档+修改文集信息
}

DocStatus = {
    10: '草稿',
    20: '发布',
}

FileSource = {
    10: '上传',
    20: '离线下载',
    30: '系统生成',
}

FileType = {
    10: '附件',
    20: '图片'
}

SettingType = {
    10: '整数',
    20: '浮点数',
    40: '字符串',
    50: '列表',
    60: '布尔',
    70: '字典',
}

VerificationType = {
    10: '注册',
    20: '忘记密码',
}

RegisterCodeStatus = {
    0: '不可用',
    10: '有效',
}