/* eslint-disable no-unused-vars */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import './Team.css'

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


export default function TreeContent() {
    const location = useLocation();
    const selectedItem = location.pathname === '/Team/Management' ? '2' : '1';

    return (
        <div className='tree-view me-2 bg-light rounded-end border d-md-flex'>
            <SimpleTreeView
                defaultExpandedItems={["Cate"]}
                defaultSelectedItems={selectedItem}
                className='bg-none'
                slots={{
                    expandIcon: ArrowRightIcon,
                    collapseIcon: ArrowDropDownIcon,
                }}
                sx={{ flexGrow: 1 }}
            >
                <CustomTreeItem itemId="Cate" label="Teams" labelIcon={Label}>
                    <Link to={"/Team"}>
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
                    </Link>
                    <Link to={'/Team/Management'}>
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
                    </Link>
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
    )
}