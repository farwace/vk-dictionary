import {ISystemActions} from "@/classes/System/Interfaces/ISystemActions";

export class SystemActions{
    private API_URL = 'http://127.0.0.1:3000/'
    checkLaunchParams = async () => {
        const params = window.location.search.slice(1);

        return false;
    }
}