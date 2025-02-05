import axios from 'axios'
const instance = window.MusicKit

export async function configure() {
    var url = 'http://localhost:5000/get_developer_token'
    axios.get(url)
    .then((response) => {
        console.log(response.data.token)
        instance.configure({
            developerToken: response.data.token,
            app: {
                name: 'Unplayed',
                build: '1.0.0'
            }
        })
        console.log('MusicKit Configured')
    })
    .catch((error) => {
        console.log('Configure Error: ', error)
    })
}

export function getMusicInstance() {
    return instance.getInstance();
}

export function isLoggedIn() {
    try {
        return getMusicInstance().isAuthorized
    }
    catch (error) {
        return false
    }
}

export function LogIn() {
    return getMusicInstance().authorize()
}

export function LogOut() {
    return getMusicInstance().unauthorize()
}

export function getHeader() {
    const header = {
        Authorization: `Bearer ${getMusicInstance().developerToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Music-User-Token': getMusicInstance().musicUserToken
    }
    return header
}