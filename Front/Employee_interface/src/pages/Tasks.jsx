import './tasks.css'

const sample = [
  { id: 1, title: 'Task title and short description', status: 'in-progress' },
  { id: 2, title: 'Task title and short description', status: 'pending' },
  { id: 3, title: 'Task title and short description', status: 'done' },
  { id: 4, title: 'Task title and short description', status: 'in-progress' },
]

function Tasks() {
  return (
    <section className="emp-tasks">
      <div className="toolbar">
        <h1>My Tasks</h1>
        <div className="right">
          <button className="btn primary">Add Task</button>
          <button className="btn">Refresh</button>
          <input className="search" placeholder="Search" />
        </div>
      </div>

      <div className="progress">
        <div className="bar"><span style={{ width: '60%' }} /></div>
        <div className="progress-stats">
          <div className="kpi"><div>Total Tasks</div><b>Tasks</b></div>
          <div className="kpi"><div>Completed</div><b>3</b></div>
          <div className="kpi"><div>Pending</div><b>#45776B</b></div>
        </div>
      </div>

      <div className="board">
        <aside className="side">
          <div className="pill active">Pending</div>
          <div className="pill">In Progress</div>
          <div className="pill">Completed</div>
        </aside>
        <div className="list">
          {sample.map((t) => (
            <div key={t.id} className="task">
              <div className="task-title">{t.title}</div>
              <div className="task-actions">
                {t.status === 'done' ? (
                  <span className="chip done">Completed</span>
                ) : (
                  <button className="btn small">View Details</button>
                )}
                <label className="check">
                  <input type="checkbox" defaultChecked={t.status === 'done'} />
                  <span className="box" />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Tasks


