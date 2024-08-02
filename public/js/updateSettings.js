import axios from 'axios';
import { showAlert } from './alert';

export const updateSettings = async (data,type) => {
    try{
        const url = type === 'password' ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword': 'http://127.0.0.1:3000/api/v1/users/updateMe';
        const res = await axios({
            method: 'PATCH',
            url,
            data
        });

        if (res.data==='success') {
            showAlert('success', `${type.toUpperCase} updated succesfully.`)
            location.reload();
        }

    }
    catch (err){
        console.log(err.response.data);
    }
}