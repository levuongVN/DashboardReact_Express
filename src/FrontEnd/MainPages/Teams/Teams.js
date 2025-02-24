/* eslint-disable no-unused-vars */
import React from 'react';
import { useUser } from '../../UserContext';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom';
import axios from 'axios';
import clsx from 'clsx';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import {
    TreeItem2Content,
    TreeItem2IconContainer,
    TreeItem2Root,
    TreeItem2GroupTransition,
} from '@mui/x-tree-view/TreeItem2';
import { useTreeItem2 } from '@mui/x-tree-view/useTreeItem2';
import { TreeItem2Provider } from '@mui/x-tree-view/TreeItem2Provider';
import { TreeItem2Icon } from '@mui/x-tree-view/TreeItem2Icon';
import './Team.css'

// import components
import Search from './Team/searchMember/search';
import DisplayMembers from '../Teams/Team/displayMembers/display';
import TreeContent from './TreeContent';
import Navbar from '../../Navigation/navbar/NavigationBars';

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
    const { user, setUser } = useUser();
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
            <Navbar />
            <div className='d-block d-md-flex col container-fluid'>
                <TreeContent />
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