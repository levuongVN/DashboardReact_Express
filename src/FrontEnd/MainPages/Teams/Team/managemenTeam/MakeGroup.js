/* eslint-disable jsx-a11y/anchor-is-valid */
import React from'react';
export default function MakeGroup() {
  return (
    <>
      <a
        href=""
        className="block text-dark max-w-sm p-6  border border-gray-200 rounded-lg shadow-sm bg-gray-100 hover:bg-gray-200"
      >
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Design Team
        </h5>
        <p className="font-normal text-gray-700 dark:text-gray-400">
          Members:
        </p>
        <div className="col-12">
          <div className="d-flex align-items-center mb-2 border-bottom pb-1">
          <img className="w-8 h-8 rounded-full" src="http://localhost:3001/uploads/1739025889480-RonaldoCry5.png" alt="Rounded avatar" />
          <h6 className="ms-2">Name</h6>
          </div>
          <div className="flex items-center mb-2 border-bottom pb-1">
            <img className="w-8 h-8 rounded-full" src="http://localhost:3001/uploads/1739025889480-RonaldoCry5.png" alt="Rounded avatar" />
            <h6 className="ms-2">Name</h6>
          </div>
        </div>
      </a>
    </>
  )
}