CollectedDocPermissions = {
    10: '公开',
    20: '访问码可见',
    30: '成员可见',
    40: '私密',
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
    10: '字符串',
    20: '文本',
    30: '整数',
    40: '浮点数',
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

AuthAction = 10
CreateAction = 100
UpdateAction = 110
DeleteAction = 120
RecoverAction = 130
ExportAction = 140
ImportAction = 150
UploadAction = 160
ActiveAction = 170
DisableAction = 180

ActionType = {
    AuthAction: '认证',
    CreateAction: '新增',
    UpdateAction: '修改',
    DeleteAction: '删除',
    RecoverAction: '还原',
    ExportAction: '导出',
    ImportAction: '导入',
    UploadAction: '上传',
    ActiveAction: '启动',
    DisableAction: '禁用',
}

WebsiteSet = [
    {'key': 'site_name', 'name': '网站名称', 'value': 'docShared', 'set_type': 10, 'description': '请输入站点名称'},
    {'key': 'site_sub_title', 'name': '子标题', 'value': '', 'set_type': 10, 'description': '请输入站点子标题'},
    {'key': 'site_keyword', 'name': '关键词', 'value': '', 'set_type': 20, 'description': '请输入站点关键字, 使用逗号分割'},
    {'key': 'site_description', 'name': '站点描述', 'value': '', 'set_type': 20, 'description': '请输入简短的描述'},
    {'key': 'site_use_help', 'name': '使用手册', 'value': '', 'set_type': 10, 'description': '请输入使用手册的访问连接'},
    {'key': 'site_config_help', 'name': '配置手册', 'value': '', 'set_type': 10, 'description': '请输入配置手册的访问连接'},
]

BaseSet = [
    {'key': 'can_register', 'name': '开启注册', 'value': True, 'set_type': 60, 'description': '开启此选项, 允许用户注册'},
    {'key': 'verify_register', 'name': '启动注册验证', 'value': False, 'set_type': 60, 'description': '开启此选项, 用户注册后需要通过邮箱获取验证码激活用户'},
    {'key': 'use_reg_code', 'name': '启用注册码', 'value': True, 'set_type': 60, 'description': '开启此选项, 用户需要使用注册码才能注册'},
    {'key': 'can_download', 'name': '文集下载', 'value': False, 'set_type': 60, 'description': '开启此选项, 文集允许导出文件以供下载，文集拥有者可进行进一步控制特定文集是否开放导出'},
    # {'key': 'max_image_size', 'name': '最大图片上传', 'value': 1024*1024*10, 'set_type': 40, 'description': '请输入最大文件上传限制, 为空则表示不限制, 单位为KB'},
    # {'key': 'max_upload_size', 'name': '最大附件上传', 'value': 1024*1024*200, 'set_type': 40, 'description': '请输入最大文件上传限制, 为空则表示不限制, 单位为KB'},
    # {'key': 'upload_type', 'name': '上传附件类型', 'value': '', 'set_type': 20, 'description': '请输入文件格式限制, 以逗号分割, 为空则表示不限制'},
    # {'key': 'statistical_code', 'name': '统计代码', 'value': '', 'set_type': 20, 'description': '如果需要第三方统计功能, 请将代码输入'},
    # {'key': 'advertising1', 'name': '广告位1', 'value': '', 'set_type': 20, 'description': '如果需要显示广告, 请将代码输入'},
    # {'key': 'advertising2', 'name': '广告位2', 'value': '', 'set_type': 20, 'description': '如果需要显示广告, 请将代码输入'},
    # {'key': 'advertising3', 'name': '广告位3', 'value': '', 'set_type': 20, 'description': '如果需要显示广告, 请将代码输入'},
]


EmailSet = [
    {'key': 'email_is_ssl', 'name': '是否使用SSL', 'value': True, 'set_type': 60, 'description': '邮箱服务端是否使用SSL'},
    {'key': 'email_host', 'name': '邮箱服务器', 'value': '', 'set_type': 10, 'description': '请输入邮箱服务器'},
    {'key': 'email_port', 'name': '邮箱端口', 'value': '', 'set_type': 10, 'description': '请输入邮箱端口'},
    {'key': 'email_host_user', 'name': '邮箱帐号', 'value': '', 'set_type': 10, 'description': '请输入邮箱帐号'},
    {'key': 'email_host_password', 'name': '邮箱密码', 'value': '', 'set_type': 10, 'description': '请输入邮箱密码'},
    {'key': 'email_from_title', 'name': '发送名称', 'value': '', 'set_type': 10, 'description': '请输入发件人名称'},
]