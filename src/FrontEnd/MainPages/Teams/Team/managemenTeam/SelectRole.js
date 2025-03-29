import React from "react";

const SelectRole = ({ selectedRole }) => {
  return (
    <form className="max-w-sm mx-auto">
      <label htmlFor="underline_select" className="sr-only">
        Underline select
      </label>
      <select
        id="underline_select"
        onChange={(e) => selectedRole(e.target.value)}
        className="block py-0 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
      >
        <option value="">Choose a role</option>
        <option value="Admin">Admin</option>
        <option value="Member">Member</option>
      </select>
    </form>
  );
};

export default SelectRole;
