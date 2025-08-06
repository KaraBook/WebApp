import { toast } from 'react-toastify';

export const successToast = (msg) => toast.success(msg);
export const errorToast = (msg) => toast.error(msg);
export const infoToast = (msg) => toast.info(msg);
export const warningToast = (msg) => toast.warning(msg);
