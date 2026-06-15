import './profile.css'

function Profile() {
  return (
    <section className="emp-profile">
      <div className="card header">
        <div className="user">
          <img className="avatar" src="https://i.pravatar.cc/80?img=12" alt="user" />
          <div>
            <h2>#19435B Mamre</h2>
            <p>Job Title</p>
          </div>
        </div>
        <div className="actions">
          <button className="btn ghost">Edit</button>
          <button className="btn primary">View Tasks</button>
        </div>
        <div className="grid fields">
          <select><option>Employee ID</option></select>
          <select><option>Department</option></select>
          <select><option>Email</option></select>
          <select><option>Department</option></select>
          <select><option>Phone</option></select>
          <select><option>Joining Date</option></select>
        </div>
      </div>

      <h3 className="section-title">Performance & Activity</h3>
      <div className="stats">
        <div className="radial">
          <div className="ring">
            <div className="inner">45776</div>
          </div>
          <div className="label">Metric</div>
        </div>
        <div className="small-cards">
          <div className="mini"><div className="dot">2</div><div><b>Tasks</b><div>Completed</div></div></div>
          <div className="mini"><div className="dot">3</div><div><b>Pending</b><div>Tasks</div></div></div>
          <div className="mini"><div className="dot">5</div><div><b>Average</b><div>Rating</div></div></div>
        </div>
      </div>
    </section>
  )
}

export default Profile


