/* eslint-disable no-unused-vars */
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom';
import axios from 'axios';
import './custom.css';
import NotificationDropdown from './notification';
import { useState, useEffect } from 'react';
import { useUser } from '../../UserContext';
import { flatMap } from 'lodash';

const navigation = [
    { name: 'Dashboard', to: '/', current: true },
    { name: 'Team', to: '/Team', current: false },
    { name: 'Projects', to: 'Projects', current: false },
    { name: 'Calendar', to: '/Calendar', current: false },
    { name: "Todo List", to: '/Todo', current: false },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
    const { user, setUser } = useUser();
    // useEffect(()=>{
    //     if(!user){
    //         console.log(false);
    //     }else{
    //         console.log(true);
    //         console.log(user.name)
    //     }
    // },[user])
return (
    <Disclosure as="nav" className="bg-gray-800">
        <div className="px-8">
            <div className="relative flex h-16 items-center justify-between">
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                    {/* Mobile menu button*/}
                    <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                        <span className="absolute -inset-0.5" />
                        <span className="sr-only">Open main menu</span>
                        <Bars3Icon aria-hidden="true" className="block size-6 group-data-[open]:hidden" />
                        <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-[open]:block" />
                    </DisclosureButton>
                </div>


                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                    <div className="flex shrink-0 items-center ">
                        <svg className='h-8 w-auto' fill="none" height="48" viewBox="0 0 24 48" width="24" xmlns="http://www.w3.org/2000/svg"><path d="m0 15.8981h17.3455l-17.061314 17.0613 2.756374 2.7564 17.06134-17.0613v17.3455h.1104l3.7877-3.7877v-15.9638l-4.2485-4.2485h-15.96596l-3.78553995 3.7855z" fill="#fff" /></svg>

                    </div>
                    <div className="hidden sm:ml-6 sm:block">
                        <div className="flex space-x-4">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.to}
                                    aria-current={item.current ? 'page' : undefined}
                                    className={classNames(
                                        item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                        'rounded-md px-3 py-2 text-sm font-medium',
                                    )}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>


                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                    {/* <button

                        type="button"
                        className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                    >
                        <span className="absolute -inset-1.5" />
                        <span className="sr-only">View notifications</span>
                        <BellIcon aria-hidden="true" className="size-6" />
                    </button> */}
                    <div className=''>
                    <NotificationDropdown />
                    </div>
                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-3">
                        <div>
                            <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                <span className="absolute -inset-1.5" />
                                <span className="sr-only">Open user menu</span>
                                <img
                                    alt=""
                                    src={user?.ImgAvt || "https://i.pinimg.com/474x/75/98/a2/7598a2291f7a6c6a220ffb010dd3384e.jpg"}
                                    className="size-10 rounded-full"
                                />
                                {!user?.name && <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white"></span>}
                            </MenuButton>
                        </div>
                        <MenuItems
                            transition
                            className="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                        >
                            {user?.name ? (
                                <>
                                    <span className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:outline-none border-bottom">Hi {user.name}</span>
                                    <MenuItem>
                                        <Link to="/Setting" className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:outline-none">
                                            Setting
                                        </Link>
                                    </MenuItem>
                                    <MenuItem>
                                        <button
                                            onClick={async () => {
                                                // console.log(user.sessionId);
                                                try {
                                                    const Log_Out = await axios.post('http://localhost:3001/logout', null, {
                                                        withCredentials: true,
                                                        headers: { 'x-session-id': localStorage.getItem('sessionId') }
                                                    });                                                        
                                                    if (Log_Out.data.message === 'Logged out successfully') {
                                                        console.log('Log out success:', Log_Out);
                                                        localStorage.removeItem('sessionId'); // Xóa sessionId sau khi logout
                                                        window.location.reload();
                                                    } else {
                                                        console.log('Log out failed:', Log_Out);
                                                    }
                                                } catch (error) {
                                                    console.error('Logout error:', error);
                                                }
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:outline-none"
                                        >
                                            Sign out
                                        </button>
                                    </MenuItem>
                                </>
                            ) : (
                                <MenuItem>
                                    <Link
                                        to="/Login"
                                        className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:outline-none"
                                    >
                                        Login
                                    </Link>
                                </MenuItem>
                            )}
                        </MenuItems>
                    </Menu>
                </div>
            </div>
        </div>

        <DisclosurePanel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
                {navigation.map((item) => (
                    <DisclosureButton
                        key={item.name}
                        as="a"
                        href={item.href}
                        aria-current={item.current ? 'page' : undefined}
                        className={classNames(
                            item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                            'block rounded-md px-3 py-2 text-base font-medium',
                        )}
                    >
                        {item.name}
                    </DisclosureButton>
                ))}
            </div>
        </DisclosurePanel>
    </Disclosure>
)
}
