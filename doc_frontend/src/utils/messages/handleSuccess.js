import {message, notification} from 'antd';
import messageDuration from "../../config/settings"

export default function handleSuccess({successTip, successType='notification'}) {
    if (successType === 'message') {
        message.error({
            content: successTip,
            duration: messageDuration,
        })
    } else {
        successTip && notification.success({
            message: '成功',
            description: successTip,
            duration: 2,
        })
    }

}
