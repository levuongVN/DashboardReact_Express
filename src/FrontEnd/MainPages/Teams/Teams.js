/* eslint-disable no-unused-vars */
import React from 'react';
import { useUser } from '../../UserContext';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom';
import axios from 'axios';
import clsx from 'clsx';
import { styled, useTheme, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Label from '@mui/icons-material/Label';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import {
    TreeItem2Content,
    TreeItem2IconContainer,
    TreeItem2Root,
    TreeItem2GroupTransition,
} from '@mui/x-tree-view/TreeItem2';
import { useTreeItem2 } from '@mui/x-tree-view/useTreeItem2';
import { TreeItem2Provider } from '@mui/x-tree-view/TreeItem2Provider';
import { TreeItem2Icon } from '@mui/x-tree-view/TreeItem2Icon';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import CodeOffIcon from '@mui/icons-material/CodeOff';
import CodeIcon from '@mui/icons-material/Code';
import PaymentIcon from '@mui/icons-material/Payment';
import AddCardIcon from '@mui/icons-material/AddCard';
import SavingsIcon from '@mui/icons-material/Savings';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import { useState } from 'react';
import './Team.css'

// import components
import Search from './Team/searchMember/search';
import DisplayMembers from '../Teams/Team/displayMembers/display';
function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const CustomTreeItemRoot = styled(TreeItem2Root)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const CustomTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
    marginBottom: theme.spacing(0.3),
    color: theme.palette.text.secondary,
    borderRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    '&.expanded': {
        fontWeight: theme.typography.fontWeightRegular,
    },
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
    '&.focused, &.selected, &.selected.focused': {
        backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
        color: 'var(--tree-view-color)',
    },
}));

const CustomTreeItemIconContainer = styled(TreeItem2IconContainer)(({ theme }) => ({
    marginRight: theme.spacing(1),
}));

const CustomTreeItemGroupTransition = styled(TreeItem2GroupTransition)(
    ({ theme }) => ({
        marginLeft: 0,
        [`& .content`]: {
            paddingLeft: theme.spacing(2),
        },
    }),
);

const CustomTreeItem = React.forwardRef(function CustomTreeItem(props, ref) {
    const theme = useTheme();
    const {
        id,
        itemId,
        label,
        disabled,
        children,
        bgColor,
        color,
        labelIcon: LabelIcon,
        labelInfo,
        colorForDarkMode,
        bgColorForDarkMode,
        ...other
    } = props;

    const {
        getRootProps,
        getContentProps,
        getIconContainerProps,
        getLabelProps,
        getGroupTransitionProps,
        status,
    } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref });

    const style = {
        '--tree-view-color': theme.palette.mode !== 'dark' ? color : colorForDarkMode,
        '--tree-view-bg-color':
            theme.palette.mode !== 'dark' ? bgColor : bgColorForDarkMode,
    };

    return (
        <TreeItem2Provider itemId={itemId}>
            <CustomTreeItemRoot {...getRootProps({ ...other, style })}>
                <CustomTreeItemContent
                    {...getContentProps({
                        className: clsx('content', {
                            expanded: status.expanded,
                            selected: status.selected,
                            focused: status.focused,
                        }),
                    })}
                >
                    <CustomTreeItemIconContainer {...getIconContainerProps()}>
                        <TreeItem2Icon status={status} />
                    </CustomTreeItemIconContainer>
                    <Box
                        sx={{
                            display: 'flex',
                            flexGrow: 1,
                            alignItems: 'center',
                            p: 0.5,
                            pr: 0,
                        }}
                    >
                        <Box component={LabelIcon} color="inherit" sx={{ mr: 1 }} />
                        <Typography
                            {...getLabelProps({
                                variant: 'body2',
                                sx: { display: 'flex', fontWeight: 'inherit', flexGrow: 1 },
                            })}
                        />
                        <Typography variant="caption" color="inherit">
                            {labelInfo}
                        </Typography>
                    </Box>
                </CustomTreeItemContent>
                {children && (
                    <CustomTreeItemGroupTransition {...getGroupTransitionProps()} />
                )}
            </CustomTreeItemRoot>
        </TreeItem2Provider>
    );
});

const navigation = [
    { name: 'Dashboard', to: '/', current: false },
    { name: 'Team', to: '/Team', current: true },
    { name: 'Projects', to: 'Projects', current: false },
    { name: 'Calendar', to: '/Calendar', current: false },
    { name: "Todo List", to: '/Todo', current: false },
]
export default function Teams() {
    const {user,setUser} = useUser();
    const handleLogout = async (e) => {
        // e.preventDefault(); // Ngăn trang reload
        try {
            const Log_Out = await axios.post('http://localhost:3001/logout', null, {
                withCredentials: true
            });                                                        
            if (Log_Out.data.message === 'Logged out successfully') {
                console.log('Log out success:', Log_Out);
                window.location.reload();
            } else {
                console.log('Log out failed:', Log_Out);
            }
        } catch (e) {
            console.log('Error logging out:', e.message);
        }
    };

    return (
        <div className='bg-dark' style={{ width: "100%", height: "100vh" }}>
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
                            <button
                                type="button"
                                className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                            >
                                <span className="absolute -inset-1.5" />
                                <span className="sr-only">View notifications</span>
                                <BellIcon aria-hidden="true" className="size-6" />
                            </button>

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
                                                    onClick={handleLogout}
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
            <div className='d-block d-md-flex col container-fluid'>
                <div className='tree-view me-2 bg-light rounded-end border d-md-flex'>
                    <SimpleTreeView
                        defaultExpandedItems={[]}
                        defaultSelectedItems="1"
                        className='bg-none'
                        slots={{
                            expandIcon: ArrowRightIcon,
                            collapseIcon: ArrowDropDownIcon,
                            // endIcon: EndIcon,
                        }}
                        sx={{ flexGrow: 1 }}
                    >
                        <CustomTreeItem itemId="Cate" label="Teams" labelIcon={Label}>
                            <CustomTreeItem
                                itemId="1"
                                label="Colleagues"
                                labelIcon={SupervisorAccountIcon}
                                labelInfo={``}
                                color="#1a73e8"
                                bgColor="#e8f0fe"
                                colorForDarkMode="#B8E7FB"
                                bgColorForDarkMode={alpha('#00b4ff', 0.2)}

                            />
                            <CustomTreeItem
                                itemId="2"
                                label="Team Management"
                                labelIcon={PersonAddAltIcon}
                                labelInfo={``}
                                color="#1a73e8"
                                bgColor="#e8f0fe"
                                colorForDarkMode="#B8E7FB"
                                bgColorForDarkMode={alpha('#00b4ff', 0.2)}

                            />
                            <CustomTreeItem
                                itemId='3'
                                label="Team Off"
                                labelIcon={CodeOffIcon}
                                labelInfo={``}
                                color="#1a73e8"
                                bgColor="#e8f0fe"
                                colorForDarkMode="#B8E7FB"
                                bgColorForDarkMode={alpha('#00b4ff', 0.2)}

                            />
                            <CustomTreeItem
                                itemId='4'
                                label="Team Tracking"
                                labelIcon={CodeIcon}
                                labelInfo={``}
                                color="#1a73e8"
                                bgColor="#e8f0fe"
                                colorForDarkMode="#B8E7FB"
                                bgColorForDarkMode={alpha('#00b4ff', 0.2)}

                            />
                        </CustomTreeItem>
                        <CustomTreeItem itemId='CatePay' label="Pay" labelIcon={PaymentIcon}>
                            <CustomTreeItem
                                itemId="Salary"
                                label="Salary"
                                labelIcon={AddCardIcon}
                                labelInfo={``}
                                color="#1a73e8"
                                bgColor="#e8f0fe"
                                colorForDarkMode="#B8E7FB"
                                bgColorForDarkMode={alpha('#00b4ff', 0.2)}
                            />
                            <CustomTreeItem
                                itemId="Bonuses"
                                label="Bonuses"
                                labelIcon={AddCardIcon}
                                labelInfo={``}
                                color="#1a73e8"
                                bgColor="#e8f0fe"
                                colorForDarkMode="#B8E7FB"
                                bgColorForDarkMode={alpha('#00b4ff', 0.2)}
                            />
                            <CustomTreeItem
                                itemId="Deductions"
                                label="Deductions" // khấu trừ
                                labelIcon={AddCardIcon}
                                labelInfo={``}
                                color="#1a73e8"
                                bgColor="#e8f0fe"
                                colorForDarkMode="#B8E7FB"
                                bgColorForDarkMode={alpha('#00b4ff', 0.2)}
                            />
                        </CustomTreeItem>
                        <CustomTreeItem itemId='CateContact' label="Total Rewards" labelIcon={SavingsIcon}>
                            <CustomTreeItem
                                itemId="TotalRewards"
                                label="Total/Projects"
                                labelIcon={PriceCheckIcon}
                                labelInfo={``}
                                color="#1a73e8"
                                bgColor="#e8f0fe"
                                colorForDarkMode="#B8E7FB"
                                bgColorForDarkMode={alpha('#00b4ff', 0.2)}
                            />
                        </CustomTreeItem>
                    </SimpleTreeView>
                </div>
                <div className='col'>
                    <div className='d-flex' >
                        <div className='header col d-block d-md-flex mt-2 mt-md-0' style={{ color: 'white' }}>
                            <div className='col'>
                                <h5>Team Members</h5>
                                <p className='fw-lighter'>Connect your team member to checking invoices automatically</p>
                            </div>
                            <div className='mb-3 mb-md-0'>
                                <Search />
                            </div>
                        </div>
                    </div>
                    <DisplayMembers />
                </div>
            </div>
        </div>
    )
}