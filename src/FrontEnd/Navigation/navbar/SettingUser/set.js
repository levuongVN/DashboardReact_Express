/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react';
import Box from '@mui/material/Box';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Link } from 'react-router-dom';
import { Avatar } from '@mui/material';

const TreeItemUserLink = [
  {
    Name: "Image avatar",
    href: '#ImageAvatar',
  },
  {
    Name: "Name",
    href: '#Email',
  },
  {
    Name: "Phone",
    href: '#Phone',
  },
  {
    Name: "Email",
    href: '#Email',
  },
  {
    Name: "Password",
    href: '#Password',
  },
]
export default function BasicSimpleTreeView(ImgAvtUsers) {
  return (
    <div className='bg-white flex' style={{ width: "100%", height: "100vh" }}>
      <div className='bg-light'>
        <Box sx={{ minHeight: 352, minWidth: 250 }}>
          <SimpleTreeView>
            <TreeItem itemId="grid" label="General">
              {Object.keys(TreeItemUserLink).map(function (key) {
                return (
                  <div key={key} className='mt-3 border-bottom'>
                    <a href={TreeItemUserLink[key].href}>{TreeItemUserLink[key].Name}</a>
                  </div>
                )
              })}
            </TreeItem>
          </SimpleTreeView>
        </Box>
      </div>


      <div className='col bg-grey'>
        <div className='ImageAvatar' id='ImageAvatar'>
        <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
          <form>
            <input type='file' id='image' name='image' accept='image/*' />
            <label htmlFor='image'>Choose an image</label>
            <button type='submit'>Upload</button>
          </form>
        </div>
        <div id='Email' className='Email'>
          <h1>This is content Email</h1>
        </div>
        <div className='Phone' id='Phone'>
          <h1>This is content Phone</h1>
        </div>
      </div>
    </div>
  );
}
