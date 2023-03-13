import React from 'react'
import { FaGithub } from 'react-icons/fa'
import { FiX } from 'react-icons/fi'
import styles from './styles.module.scss'
import { signIn, signOut, useSession } from 'next-auth/react' //useSession retornar informações se o usuário está ativo ou não


export default function SignInButton(props) {
    const {data: session} = useSession();
    // console.log(useSession().data)
    return session ? (
        (
            <button
                type='button'
                className={styles.signInButton}
                onClick={()=> signOut()}
            >
                <FaGithub color="#04d361"/> 
                    {session.user.name}
                <FiX color='#737388' className={styles.closeIcon}/>
            </button>
        )
    ) : (
        (
            <button
                type='button'
                className={styles.signInButton}
                onClick={()=>signIn('github')}
            >
                <FaGithub color="#eba417" /> Sign in with Github
            </button>
        )
    )
}
