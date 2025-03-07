exports.InviteGroup = (req, res) => {
    const {NameTeam, EmailLeader} = req.body;
    console.log(NameTeam, EmailLeader);
}