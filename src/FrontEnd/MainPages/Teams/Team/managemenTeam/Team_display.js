import { React, useState, useEffect } from 'react';
import { useUser } from "../../../../UserContext";
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function MakeGroup() {
  const { user } = useUser();
  const [teams, setTeams] = useState([
    {
      TeamName: '',
      LeaderName: '',
      LeaderEmail: '',
      LeaderAvatar: '',
      Members: [
        {
          MemberEmail: '',
          MemberName: '',
          MemberRole: '',
          MemberAvatar: ''
        }
      ]
    }
  ]);

  useEffect(() => {
    const FetchTeams = async () => {
      try {
        const res = await axios.get('http://localhost:3001/get-teams', {
          params: { EmailLeader: user?.email },
          withCredentials: true
        });
        
        if (res.data.success) {
          // Tạo một object để nhóm các team theo TeamID
          const teamsMap = {};
          
          res.data.data.forEach(teamData => {
            if (!teamsMap[teamData.TeamID]) {
              // Nếu team chưa tồn tại, tạo mới
              teamsMap[teamData.TeamID] = {
                TeamID: teamData.TeamID,
                TeamName: teamData.TeamName,
                LeaderName: teamData.LeaderName,
                LeaderEmail: teamData.LeaderEmail,
                LeaderAvatar: teamData.LeaderAvatar,
                Members: []
              };
            }
            
            // Thêm member vào team (nếu có member)
            if (teamData.MemberName) {
              teamsMap[teamData.TeamID].Members.push({
                MemberEmail: teamData.MemberEmail,
                MemberName: teamData.MemberName,
                MemberRole: teamData.MemberRole,
                MemberAvatar: teamData.MemberAvatar
              });
            }
          });
          
          // Chuyển object thành mảng
          const teamsArray = Object.values(teamsMap);
          console.log(teamsArray)
          // Cập nhật state
          setTeams(teamsArray);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    }
    if (user?.email) {
      FetchTeams();
    }
  }, [user]);
  // console.log(teams)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {teams.map((team, index) => (
        <Link
          to={`/Team/Management/Team-Detail/${team.TeamID}`}
          key={index}
          className="block text-dark p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-100 hover:bg-gray-200 cursor-pointer"
        >
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {team.TeamName}
          </h5>
          {team.LeaderName && (
            <div className="col-12">
              <p className="font-normal text-gray-700 dark:text-gray-400">
                Members:
              </p>
              <div className="flex items-center mb-2 border-bottom pb-1">
                <img
                  className="w-8 h-8 rounded-full"
                  src={team.LeaderAvatar}
                  alt="Leader avatar"
                />
                <h6 className="ms-2">
                  {team.LeaderName} (Leader)
                </h6>
              </div>
              {/* Thay đổi phần hiển thị members */}
              {team.Members.map((member, memberIndex) => (
                <div key={memberIndex} className="flex items-center mb-2 border-bottom pb-1">
                  <img
                    className="w-8 h-8 rounded-full"
                    src={member.MemberAvatar}
                    alt="Member avatar"
                  />
                  <h6 className="ms-2">
                    {member.MemberName} ({member.MemberRole})
                  </h6>
                </div>
              ))}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}