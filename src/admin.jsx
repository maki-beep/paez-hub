const adminClasses = [
  ["PC","Pre-Calculus","STEM-A","PRECAL-101",30],
  ["GP","General Physics 1","STEM-A","PHYS-101",30],
  ["GC","General Chemistry 1","STEM-B","CHEM-101",32],
  ["BM","Business Mathematics","ABM-A","BMATH-101",28],
];
const adminStudents = [
  ["MA","Aquino, Mark","Submitted","Submitted · 10:42 AM"],
  ["RB","Bautista, Rina","In progress","Question 14 of 20"],
  ["JC","Cruz, Jevon","Submitted","Submitted · 10:51 AM"],
  ["AD","Dela Cruz, Anna","In progress","Question 9 of 20"],
  ["KM","Ramos, Karylle","Submitted","Submitted · 10:38 AM"],
  ["PR","Reyes, Paolo","Locked","Switched apps 3 times"],
  ["LS","Santiago, Lea","Not started","Not started"],
  ["JV","Villanueva, Joel","In progress","Question 17 of 20"],
].map(([initials,name,status,detail],index)=>({initials,name,status,detail,number:"2024-00"+(110+index)+"-MN-0"}));
const adminResults = [["Ramos, K.",100,"Passed"],["Reyes, P.",92,"Passed"],["Cruz, J.",85,"Passed"],["Santiago, L.",58,"Failed"],["Villanueva, J.","–","Missing"]];
const adminUpdates = [
  ["Exam submissions","Midterm Examination is in progress","18 of 30 students have submitted · Pre-Calculus · STEM-A","Open exam monitor","Exam Monitor","5 min ago"],
  ["Security flag","A student switched tabs during the exam","Reyes, Paolo switched apps 3 times.","View in monitor","Exam Monitor","12 min ago"],
  ["Sync","3 items are waiting to sync","Connect the Hub to the internet, then select Sync All.","Go to Sync All","Profile","1 hr ago"],
  ["Results","Sync completed","Grades were backed up to the cloud.","View records","Records","1 day ago"],
  ["Modules","Functions and Their Graphs.pdf was uploaded","Now visible to students in Pre-Calculus · STEM-A.","Open modules","Modules","1 day ago"],
];
const adminIcon = {
  Home:"nav-home",Classes:"nav-classes",Records:"records",Profile:"nav-profile",
  Notifications:"bell","Generate Access Code":"key","Upload Material":"plus","New Assessment":"assessment",
};
const adminClassTabs = ["Students","Modules","Assessments"];

function AdminIcon({name}) {
  return <img alt="" className="admin-icon" src={"/assets/paez-"+adminIcon[name]+".svg"}/>;
}
function AdminButton({children, onClick, tone="", type="button", ...props}) {
  return <button type={type} className={"admin-button "+tone} onClick={onClick} {...props}>{children}</button>;
}
function AdminCard({children, className=""}) {
  return <section className={"admin-card "+className}>{children}</section>;
}
function AdminLabel({children}) { return <p className="admin-label">{children}</p>; }
function AdminField({label,children,...props}) {
  return <label className="admin-field"><span>{label}</span>{children || <input {...props}/>}</label>;
}
function AdminStats({values}) {
  return <div className="admin-stats">{values.map(([label,total,color])=><div key={label} className={color}><strong>{total}</strong><small>{label}</small></div>)}</div>;
}
function AdminStudent({student,detail,children}) {
  return <div className="admin-row admin-student">
    <span className="admin-avatar">{student.initials}</span><strong>{student.name}</strong><span className="admin-detail">{detail || student.number}</span>{children}
  </div>;
}

function AdminPortal({onLogout}) {
  const [page,setPage] = React.useState("Home");
  const [subject,setSubject] = React.useState(0);
  const [query,setQuery] = React.useState("");
  const [selected,setSelected] = React.useState(null);
  const [dialog,setDialog] = React.useState(null);
  const [status,setStatus] = React.useState("");
  const [closed,setClosed] = React.useState(false);
  const [unlocked,setUnlocked] = React.useState([]);
  const [examFilter,setExamFilter] = React.useState("All");
  const [notificationFilter,setNotificationFilter] = React.useState("All");
  const [unread,setUnread] = React.useState(3);
  const [cleared,setCleared] = React.useState(false);
  const [synced,setSynced] = React.useState(false);
  const [materials,setMaterials] = React.useState([
    {title:"Functions and Their Graphs.pdf",visible:true,subject:0},
    {title:"Trigonometric Identities Guide.pdf",visible:true,subject:0},
    {title:"Conic Sections Practice.pdf",visible:false,subject:0},
  ]);
  const [assessments,setAssessments] = React.useState([
    {title:"Midterm Examination",grade:"60% submitted",state:"Active",subject:0},
    {title:"Functions and Graphs Worksheet",grade:"28/30 avg",state:"Completed",subject:0},
    {title:"Final Examination",grade:"–",state:"Draft",subject:0},
  ]);
  const [recordAssessment,setRecordAssessment] = React.useState("Midterm Examination");
  const [file,setFile] = React.useState(null);
  const [preview,setPreview] = React.useState(null);
  const [previewUrl,setPreviewUrl] = React.useState("");
  const [draft,setDraft] = React.useState({title:"Functions mastery quiz",type:"Quiz",minutes:"30",instructions:"Choose the best answer for each question. Work independently and submit before the timer ends."});
  const dialogRef = React.useRef(null);
  const title = page==="Students" && selected ? "Student actions" : page;
  const [,className,section,classCode,enrollment] = adminClasses[subject];
  const classLabel = className+" · "+section;
  const classWorkspace = adminClassTabs.includes(page);
  const activeNav = classWorkspace || ["Upload material","New assessment","Assessment questions","Material preview"].includes(page) ? "Classes" : page==="Exam Monitor" ? "Home" : page;
  const records = subject===0 && recordAssessment==="Midterm Examination" ? adminResults : [];
  const examTitle = "Midterm Examination - "+(closed?"Closed":"Active");

  React.useEffect(()=>{
    if(dialog && !dialogRef.current.open) dialogRef.current.showModal();
    if(!dialog && dialogRef.current.open) dialogRef.current.close();
  },[dialog]);
  React.useEffect(()=>{
    if(!preview?.file) { setPreviewUrl(""); return; }
    const url=URL.createObjectURL(preview.file);
    setPreviewUrl(url);
    return ()=>URL.revokeObjectURL(url);
  },[preview]);
  React.useEffect(()=>{
    if(!status) return;
    const timer=setTimeout(()=>setStatus(""),3800);
    return ()=>clearTimeout(timer);
  },[status]);

  function go(next) {
    setPage(next);
    setSelected(null);
    setQuery("");
    setDialog(null);
    window.scrollTo(0,0);
  }
  function open(name,student=null) { setDialog({name,student}); }
  function complete(name,value) { setDialog({name,value}); }
  function exportRecords() {
    const csv = ["Student,Subject,Assessment,Score,Status",...records.map(([name,score,state])=>
      [name,className,recordAssessment,score,state].map(value=>'"'+String(value).replaceAll('"','""')+'"').join(","))].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
    const link = document.createElement("a");
    link.href=url;
    link.download=classCode+"-records.csv";
    link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    setDialog(null);
  }
  function publishMaterial(event) {
    event.preventDefault();
    if(!file) {setStatus("Choose a PDF file first.");return;}
    const fields = new FormData(event.currentTarget);
    const title = fields.get("title").trim();
    if(!title) {setStatus("Enter a material title.");return;}
    const material = {title:/\.pdf$/i.test(title)?title:title+".pdf",description:fields.get("description"),file,visible:true,subject};
    setMaterials(items=>[material,...items.filter(item=>item.title!==material.title || item.subject!==subject)]);
    setPreview(material);
    complete("Material published",material.title);
  }
  function publishAssessment() {
    setAssessments(items=>[...items,{...draft,grade:"0% submitted",state:"Active",subject}]);
    complete("Assessment published",draft.title);
  }
  const tabs = (items,active,choose) => <div className="admin-tabs">{items.map(item=>
    <AdminButton key={item} tone={item===active?"primary":""} aria-pressed={item===active} onClick={()=>choose(item)}>{item}</AdminButton>)}</div>;
  const back = (label,destination) => <AdminButton tone="admin-back" onClick={()=>go(destination)}>‹ {label}</AdminButton>;
  const progress = <progress value="18" max="30" aria-label="Students who submitted"/>;
  const closeExam = <AdminButton tone="danger" disabled={closed} onClick={()=>open("Close examination")}>Force Close Exam</AdminButton>;
  const quickActions = [["Generate Access Code",()=>open("Generate access code")],["Upload Material",()=>{setFile(null);go("Upload material");}],["New Assessment",()=>go("New assessment")]];
  const nav = name => <button key={name} type="button" onClick={()=>go(name)} aria-current={activeNav===name?"page":undefined}>
    <span><AdminIcon name={name}/></span>{name}</button>;
  const studentActions = student => <div className="admin-student-actions">
    {["Issue Exemption Token","Unlock Student","Contact"].map(name=><AdminButton key={name} onClick={()=>open(name,student)}>{name}</AdminButton>)}
  </div>;
  const profileSettings = [["Security Questions","Used for offline recovery"],["Change Password","Update your account password"],["Network Configuration","Hub connection settings"]];
  const intro = (heading,description) => <AdminCard className="admin-intro"><h2>{heading}</h2><p>{description}</p></AdminCard>;
  let content;
  switch(page) {
    case "Home":
      content=<>
        <AdminCard className="admin-hero"><div><AdminLabel>Active Session</AdminLabel><h2>Pre-Calculus</h2><p><span>Section: STEM-A</span><span>Schedule: 10:00 AM - 11:30 AM</span></p></div></AdminCard>
        <div className="admin-stack">
          <AdminCard className="admin-quick"><AdminLabel>Quick actions</AdminLabel><div>
            {quickActions.map(([name,action])=><AdminButton key={name} onClick={action}><span><AdminIcon name={name}/></span>{name}</AdminButton>)}
          </div></AdminCard>
          <AdminCard className="admin-live"><AdminLabel>Live assessment status</AdminLabel><h2>{examTitle}</h2>{progress}<p>18 / 30 Students Submitted</p><div className="admin-buttons">
            <AdminButton onClick={()=>go("Exam Monitor")}>Monitor students</AdminButton>{closeExam}
          </div></AdminCard>
        </div>
      </>;
      break;
    case "Classes":
      content=<div className="admin-grid admin-classes">{adminClasses.map(([initials,name,group,code,count],index)=><button key={code} className="admin-class" onClick={()=>{setSubject(index);go("Students");}}>
        <span className="admin-avatar">{initials}</span><div><small>{group}</small><h2>{name}</h2><p>Class Code: {code}</p><p className="admin-mobile-only">{count} Enrolled Students</p></div><span className="admin-mobile-only">›</span>
      </button>)}</div>;
      break;
    case "Students":
      content=<AdminCard className="admin-list admin-students">
        <input className="admin-search" aria-label="Search student name" placeholder="Search student name..." value={query} onChange={event=>{setQuery(event.target.value);setSelected(null);}}/>
        <div className="admin-rows">{(subject===0?adminStudents:[]).filter(student=>student.name.toLowerCase().includes(query.trim().toLowerCase())).map(student=>
          <div className="admin-student-entry" key={student.number}>
            <AdminStudent student={student}><button className="admin-more" aria-label={"Actions for "+student.name} aria-expanded={selected===student} onClick={()=>setSelected(selected===student?null:student)}>···</button></AdminStudent>
            {selected===student && studentActions(student)}
          </div>)}
        {(!subject && !adminStudents.some(student=>student.name.toLowerCase().includes(query.trim().toLowerCase())) || subject!==0) && <p>No students found.</p>}</div>
      </AdminCard>;
      break;
    case "Modules":
      content=<AdminCard className="admin-list admin-resource-list"><AdminButton tone="outline" onClick={()=>{setFile(null);go("Upload material");}}>+ Upload PDF Material</AdminButton>
        <div className="admin-rows">{materials.filter(item=>item.subject===subject).map(item=><button key={item.title} className="admin-row admin-resource" onClick={()=>{setPreview(item);go("Material preview");}}>
          <strong>{item.title}</strong><span className="admin-pill">{item.visible?"Visible to students":"Hidden from students"}</span></button>)}
          {!materials.some(item=>item.subject===subject) && <p>No materials published.</p>}</div>
      </AdminCard>;
      break;
    case "Assessments":
      content=<AdminCard className="admin-list admin-resource-list"><AdminButton tone="outline" onClick={()=>go("New assessment")}>+ Create Task</AdminButton>
        <div className="admin-rows">{assessments.filter(item=>item.subject===subject).map((item,index)=>{
          const isMidterm=item.title==="Midterm Examination";
          return <div key={index} className="admin-row admin-resource"><strong>{isMidterm?<button onClick={()=>go("Exam Monitor")}>{item.title}</button>:item.title}</strong><span className="admin-detail">Grade: {item.grade}</span><span className="admin-pill">{isMidterm&&closed?"Closed":item.state}</span></div>;
        })}{!assessments.some(item=>item.subject===subject) && <p>No assessments published.</p>}</div>
      </AdminCard>;
      break;
    case "Records":
      content=<>
        <AdminCard className="admin-record-filters"><AdminLabel>Filter &amp; export</AdminLabel><div>
          <AdminField label="Filter by subject"><select value={subject} onChange={event=>{setSubject(Number(event.target.value));setRecordAssessment("Midterm Examination");}}>{adminClasses.map((entry,index)=><option value={index} key={entry[3]}>{entry[1]}</option>)}</select></AdminField>
          <AdminField label="Section"><select value={section} onChange={event=>setSubject(adminClasses.findIndex(entry=>entry[2]===event.target.value))}>{[...new Set(adminClasses.map(entry=>entry[2]))].map(group=><option key={group}>{group}</option>)}</select></AdminField>
          <AdminField label="Assessment"><select value={recordAssessment} onChange={event=>setRecordAssessment(event.target.value)}>{[...new Set(["Midterm Examination",...assessments.filter(item=>item.subject===subject).map(item=>item.title)])].map(name=><option key={name}>{name}</option>)}</select></AdminField>
          <AdminButton tone="success" onClick={()=>open("Export records")}>Download CSV Spreadsheet</AdminButton>
        </div></AdminCard>
        <AdminCard><AdminLabel>Live data</AdminLabel><h2>Preview Results</h2>
          <table className="admin-table"><thead><tr>{["Student","Subject","Assessment","Score","Status"].map(value=><th key={value}>{value}</th>)}</tr></thead>
            <tbody>{records.map(([name,score,state])=><tr key={name}><th scope="row">{name}</th><td>Pre-Calc</td><td>Midterm</td><td>{score}</td><td><span className={"admin-pill "+(state==="Passed"?"present":"")}>{state}</span></td></tr>)}</tbody></table>
          {!records.length && <p>No results for the selected filters.</p>}
        </AdminCard>
      </>;
      break;
    case "Profile":
      content=<>
        <AdminCard className="admin-profile"><span className="admin-avatar">PS</span><div><h2>Prof. Santos</h2><p>Senior High School Math Department <span>·</span> <a href="mailto:prof.santos@earist.edu.ph">prof.santos@earist.edu.ph</a></p></div><span className="admin-pill">Pending verification</span></AdminCard>
        <div className="admin-grid">
          <AdminCard><AdminLabel>System status</AdminLabel><h2>Offline &amp; Sync</h2><div className="admin-rows">
            {[["Local Storage","24.5 GB Free"],["Cloud Sync",synced?"Last synced: just now":"Last synced: 2 hours ago"],["Pending Sync",synced?"Up to date":"3 items waiting"]].map(([label,value])=><div className="admin-row admin-setting" key={label}><strong>{label}</strong><span>{value}</span></div>)}
          </div><AdminButton tone="primary" onClick={()=>{setSynced(true);complete("Sync complete","Grades are up to date in this preview.");}}>Sync All</AdminButton></AdminCard>
          <AdminCard><AdminLabel>Security &amp; access</AdminLabel><h2>Account Settings</h2><div className="admin-rows">
            {profileSettings.map(([label,value])=><button className="admin-row admin-setting" key={label} onClick={()=>open(label)}><strong>{label}</strong><span>{value}</span></button>)}
          </div><AdminButton tone="danger filled admin-desktop-logout" onClick={()=>open("Confirm logout")}>Logout</AdminButton></AdminCard>
        </div><div className="admin-mobile-only"><AdminButton tone="danger filled" onClick={()=>open("Confirm logout")}>Logout</AdminButton></div>
      </>;
      break;
    case "Exam Monitor":
      content=<>{back("Home","Home")}<div className="admin-grid admin-monitor">
        <AdminCard className="admin-live"><AdminLabel>Live assessment status</AdminLabel><h2>{examTitle}</h2>{progress}<p>18 / 30 Students Submitted</p>
          <AdminStats values={[["Submitted",18,"present"],["In progress",8+unlocked.length],["Not started",3],["Locked",1-unlocked.length,"absent"]]}/>
          <div className="admin-desktop-only">{closeExam}</div>
        </AdminCard>
        <AdminCard className="admin-monitor-list">{tabs(["All","Submitted","In progress","Not started","Locked"],examFilter,setExamFilter)}
          <div className="admin-rows">{adminStudents.map(student=>unlocked.includes(student.number)?{...student,status:"In progress",detail:"Session unlocked"}:student)
            .filter(student=>examFilter==="All" || student.status===examFilter).map(student=><AdminStudent key={student.number} student={student} detail={student.detail}>
              <div className="admin-row-actions">{student.status==="Locked" && <AdminButton tone="primary" onClick={()=>open("Unlock Student",student)}>Unlock</AdminButton>}<span className={"admin-pill "+(student.status==="Locked"?"absent":student.status==="Submitted"?"present":"")}>{student.status}</span></div>
            </AdminStudent>)}
            {examFilter==="Locked" && unlocked.includes(adminStudents[5].number) && <p>No locked students.</p>}
          </div>
        </AdminCard>
      </div><div className="admin-mobile-only admin-center">{closeExam}</div></>;
      break;
    case "Notifications":
      content=<>
        <AdminCard className="admin-hero admin-updates"><div><AdminLabel>Your updates</AdminLabel><h2>Stay in the loop.</h2><p>You have {unread} unread notifications about your classes.</p></div></AdminCard>
        <div className="admin-toolbar">{tabs(["All","Unread"],notificationFilter,setNotificationFilter)}<div className="admin-buttons">
          <AdminButton tone="plain" onClick={()=>setUnread(0)}>Mark all as read</AdminButton><AdminButton tone="plain" onClick={()=>{setUnread(0);setCleared(true);}}>Clear all</AdminButton>
        </div></div>
        {cleared || (notificationFilter==="Unread" && !unread) ? <AdminCard>No {notificationFilter==="Unread"?"unread ":""}notifications.</AdminCard> :
          <div className="admin-grid">{["Today","Yesterday"].filter(group=>group==="Today"||notificationFilter==="All").map((group,index)=><AdminCard className="admin-notifications" key={group}>
            <div><h2>{group}</h2><small>{index?"Already read":unread+" unread"}</small></div>
            {adminUpdates.slice(index?3:0,index?5:3).map(([label,heading,description,action,destination,time])=><article key={heading} className={!index&&unread?"unread":""}>
              <small>{label}</small><time>{time}</time><strong>{heading}</strong><p>{description}</p><button onClick={()=>{if(destination==="Modules")setSubject(0);go(destination);}}>{action} ›</button>
            </article>)}
          </AdminCard>)}</div>}
      </>;
      break;
    case "Upload material":
      content=<>{back("Home","Home")}{intro("Upload material","Share a PDF with your class through the Hub.")}
        <form className="admin-grid admin-editor" onSubmit={publishMaterial}>
          <AdminCard><AdminLabel>Material details</AdminLabel><AdminField label="Subject & section" value={classLabel} readOnly/><AdminField label="Material title" name="title" placeholder="Functions and Their Graphs" required/><AdminField label="Description"><textarea name="description" placeholder="Describe this material"/></AdminField></AdminCard>
          <div className="admin-stack"><AdminCard><AdminLabel>PDF document</AdminLabel>{file&&<p>{file.name}</p>}<AdminField label="Choose PDF file"><input type="file" accept=".pdf,application/pdf" onChange={event=>{const next=event.target.files[0];if(next&&!/\.pdf$/i.test(next.name)){event.target.value="";setFile(null);setStatus("Choose a PDF file.");return;}setFile(next||null);}}/></AdminField></AdminCard>
          <AdminCard><AdminLabel>Availability</AdminLabel><AdminField label="Publish to" value={"All "+enrollment+" students in "+section} readOnly/></AdminCard>
          <AdminButton type="submit" tone="primary">Publish material</AdminButton><AdminButton tone="soft" onClick={()=>go("Modules")}>Cancel</AdminButton></div>
        </form></>;
      break;
    case "New assessment":
      content=<>{intro("New assessment","Set the details before adding your questions.")}
        <form className="admin-grid admin-editor" onSubmit={event=>{event.preventDefault();if(draft.title.trim())go("Assessment questions");}}>
          <AdminCard><AdminLabel>Assessment details</AdminLabel><AdminField label="Subject & section" value={classLabel} readOnly/>
            <AdminField label="Assessment title" required value={draft.title} onChange={event=>setDraft({...draft,title:event.target.value})}/>
            <AdminField label="Type"><select value={draft.type} onChange={event=>setDraft({...draft,type:event.target.value})}><option>Quiz</option><option>Examination</option><option>Worksheet</option></select></AdminField>
            <AdminField label="Instructions"><textarea value={draft.instructions} onChange={event=>setDraft({...draft,instructions:event.target.value})}/></AdminField>
          </AdminCard><div className="admin-stack"><AdminCard><AdminLabel>Schedule &amp; scoring</AdminLabel><AdminField label="Availability" value="Available immediately after publishing" readOnly/>
            <AdminField label="Time limit (minutes)" type="number" min="1" required value={draft.minutes} onChange={event=>setDraft({...draft,minutes:event.target.value})}/>
            <AdminField label="Scoring" value="5 points per question · 10 points total" readOnly/></AdminCard>
            <AdminButton type="submit" tone="primary">Continue to questions</AdminButton><AdminButton tone="soft" onClick={()=>go("Assessments")}>Cancel</AdminButton>
          </div>
        </form></>;
      break;
    case "Assessment questions":
      content=<>{intro("Review questions","2 multiple-choice questions · 10 points total")}<div className="admin-grid admin-editor">
        <div className="admin-stack">{[
          ["What is the domain of f(x) = 1 / (x − 2)?",["All real numbers","All real numbers except 2","x > 2 only","x < 2 only"],"B"],
          ["If f(x) = 2x + 3, what is f(4)?",["7","8","11","14"],"C"],
        ].map(([question,choices,answer],index)=><AdminCard key={question}><AdminLabel>Question {index+1} · 5 points</AdminLabel><h3>{question}</h3><ol type="A">{choices.map(choice=><li key={choice}>{choice}</li>)}</ol><p className="admin-inset">Correct answer: {answer}</p></AdminCard>)}</div>
        <div className="admin-stack"><AdminCard><AdminLabel>Publishing summary</AdminLabel><p>{classLabel}<br/>{draft.minutes}-minute time limit · {enrollment} enrolled students</p></AdminCard>
          <AdminButton tone="primary" onClick={publishAssessment}>Publish assessment</AdminButton><AdminButton tone="soft" onClick={()=>go("New assessment")}>Edit assessment details</AdminButton></div>
      </div></>;
      break;
    case "Material preview":
      content=<>{intro("Material preview",preview?.title)}<div className="admin-grid admin-editor">
        <AdminCard>{preview?.file ? <>{previewUrl && <object className="admin-pdf" data={previewUrl} type="application/pdf" aria-label={preview.title}><a href={previewUrl} download={preview.title}>Download PDF</a></object>}</> :
          preview?.title==="Functions and Their Graphs.pdf" ? <><AdminLabel>PDF · Page 1 of 1</AdminLabel><AdminLabel>Pre-Calculus</AdminLabel><h2>Functions and Their Graphs</h2><p>STEM-A · Learning reference</p>
          <h3>01 What is a function?</h3><p>A function assigns each input exactly one output. The domain is the set of allowed inputs; the range is the set of resulting outputs.</p>
          <p className="admin-inset">Example<br/>f(x) = 2x + 3<br/>When x = 4, f(4) = 11.</p><h3>02 Reading a graph</h3><p>The horizontal axis shows the input x. The vertical axis shows the output f(x).</p><h3>03 Check your understanding</h3><p>Find the domain of f(x) = 1 / (x − 2). Explain why x = 2 is excluded.</p></> :
          <p>No PDF is attached to this sample material.</p>}</AdminCard>
        <div className="admin-stack"><p className="admin-inset">{preview?.visible?"Visible to students":"Hidden from students"}</p><AdminButton tone="primary" onClick={()=>go("Modules")}>Back to modules</AdminButton></div>
      </div></>;
      break;
  }

  return <div className="admin-shell" data-admin-page={page}>
    <nav className="admin-nav" aria-label="Admin navigation">
      <button type="button" className="admin-mark" onClick={()=>go("Home")} aria-label="Admin home"><img src="/assets/paez-rail-mark.png" alt=""/></button>
      <div className="admin-nav-primary">{["Home","Classes","Records"].map(nav)}</div>
      <div className="admin-nav-account">
        <button type="button" className="admin-nav-logout" aria-label="Logout" onClick={()=>open("Confirm logout")}>
          <img src="/assets/paez-nav-logout.svg" alt=""/>
        </button>
        {nav("Profile")}
      </div>
    </nav>
    <main className="admin-main">
      <header className="admin-header">
        <span className="admin-mobile-mark"><img src="/assets/paez-mobile-mark.svg" alt=""/></span>
        <div><p>Admin Portal</p><h1>{title}</h1></div>
        <div className="admin-hub"><button type="button" aria-label="Notifications" onClick={()=>go("Notifications")}><AdminIcon name="Notifications"/>{page==="Notifications"&&unread>0&&<span>{unread}</span>}</button><span><i/>Hub Connected</span></div>
      </header>
      {classWorkspace && <div className="admin-class-tabs">{back("All subjects","Classes")}{tabs(adminClassTabs,page,go)}</div>}
      {content}
    </main>
    <dialog className="admin-dialog" ref={dialogRef} onCancel={()=>setDialog(null)} aria-labelledby="admin-dialog-title">
      {dialog && <><AdminLabel>Admin Portal</AdminLabel><h2 id="admin-dialog-title">{dialog.name}</h2>
        <AdminDialogBody dialog={dialog} classLabel={classLabel} recordAssessment={recordAssessment} onCancel={()=>setDialog(null)}
          onComplete={complete} onGo={go} onExport={exportRecords} onLogout={onLogout} onCloseExam={()=>setClosed(true)}
          onUnlock={student=>{if(student.status==="Locked")setUnlocked(items=>items.includes(student.number)?items:[...items,student.number]);}}/>
      </>}
    </dialog>
    {status && <div className="portal-status" role="status">{status}</div>}
  </div>;
}


function AdminDialogBody({dialog,classLabel,recordAssessment,onCancel,onComplete,onGo,onExport,onLogout,onCloseExam,onUnlock}) {
  const {name,student,value} = dialog;
  const [copyStatus,setCopyStatus] = React.useState("");
  React.useEffect(()=>setCopyStatus(""),[dialog]);
  const generate = prefix => prefix+"-"+Array.from(crypto.getRandomValues(new Uint8Array(3)),item=>item.toString(16).padStart(2,"0")).join("").toUpperCase();
  const form = (fields,action,submit,tone="primary") => <form onSubmit={event=>{event.preventDefault();action(new FormData(event.currentTarget));}}>
    {fields}<div className="admin-buttons"><AdminButton onClick={onCancel}>Cancel</AdminButton><AdminButton type="submit" tone={tone}>{submit}</AdminButton></div>
  </form>;
  const summary = student && <p className="admin-inset"><strong>{student.name}</strong><br/>{student.number} · {classLabel}</p>;
  switch(name) {
    case "Generate access code":
      return form(<><p>Create a temporary code for students to join this class.</p><AdminField label="Subject & section" value={classLabel} readOnly/>
        <AdminField label="Valid for"><select name="expiry"><option>15 minutes</option><option>30 minutes</option><option>1 hour</option></select></AdminField></>,
        fields=>onComplete("Access code ready",{code:generate("ACCESS"),detail:classLabel+" · "+fields.get("expiry")}),"Generate code");
    case "Issue Exemption Token":
      return form(<>{summary}<AdminField label="Reason"><textarea required name="reason"/></AdminField></>,()=>onComplete("Exemption token ready",{code:generate("EXEMPT"),detail:student.name}),"Issue token");
    case "Access code ready":
    case "Exemption token ready":
      return <><p>{value.detail}</p><output>{value.code}</output><div className="admin-buttons">
        <AdminButton onClick={async()=>{try{await navigator.clipboard.writeText(value.code);setCopyStatus("Copied");}catch{setCopyStatus("Select the code to copy it.");}}}>Copy code</AdminButton><AdminButton tone="primary" onClick={onCancel}>Done</AdminButton>
      </div><small role="status">{copyStatus}</small></>;
    case "Close examination":
      return form(<><p>Close the Midterm Examination for Pre-Calculus · STEM-A?</p><p className="admin-inset">18 of 30 students have submitted. This ends the active examination in this preview.</p></>,
        ()=>{onCloseExam();onComplete("Examination closed","Midterm Examination · Pre-Calculus · STEM-A");},"Close examination","danger filled");
    case "Unlock Student":
      return form(<>{summary}<p>{student.status==="Locked"?"Allow this student to resume the examination.":"This student has no locked examination in this preview."}</p></>,
        ()=>{onUnlock(student);onComplete("Student unlocked",student.name);},"Unlock student");
    case "Contact": {
      const [last,first] = student.name.split(", ");
      const address = (first+"."+last).toLowerCase().replaceAll(" ","")+"@earist.edu.ph";
      return <>{summary}<AdminLabel>Institutional email</AdminLabel><a className="admin-button soft" href={"mailto:"+address}>{address}</a><div className="admin-buttons"><AdminButton onClick={onCancel}>Done</AdminButton></div></>;
    }
    case "Export records":
      return form(<><p className="admin-inset">{classLabel}<br/>{recordAssessment}<br/>CSV spreadsheet</p><p>Includes student, subject, assessment, score, and status.</p></>,onExport,"Download CSV");
    case "Security Questions":
      return form(<><p>Update the questions used for offline recovery.</p>{[1,2].map(index=><React.Fragment key={index}><AdminField label={"Security question "+index}><select required defaultValue=""><option value="" disabled>Select a question</option><option>What was your childhood nickname?</option><option>What was the name of your first school?</option><option>What is a place you remember visiting?</option></select></AdminField><AdminField label={"Answer "+index} type="password" required/></React.Fragment>)}</>,
        ()=>onComplete("Security questions saved","The form passed validation in this preview."),"Save questions");
    case "Change Password":
      return form(<><AdminField label="Current password" type="password" autoComplete="current-password" required/>
        <AdminField label="New password" type="password" autoComplete="new-password" minLength="12" pattern="(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{12,}" title="Use at least 12 characters with uppercase, lowercase, a number, and a special character." name="password" required/>
        <AdminField label="Confirm new password" type="password" autoComplete="new-password" name="confirm" required onChange={()=>setCopyStatus("")}/><p role="status">{copyStatus}</p></>,
        fields=>fields.get("password")===fields.get("confirm")?onComplete("Password form validated","The form passed validation in this preview."):setCopyStatus("The new passwords must match."),"Change password");
    case "Network Configuration":
      return form(<><p>Configure the connection to the classroom Hub.</p><AdminField label="Hub address" type="text" placeholder="paez-hub.local" required/><AdminField label="Port" type="number" min="1" max="65535" defaultValue="443" required/></>,
        ()=>onComplete("Network configuration checked","The form passed validation in this preview."),"Connect & sync");
    case "Confirm logout":
      return form(<p>Do you want to log out of the Admin Portal?</p>,onLogout,"Logout","danger filled");
    default:
      return <><p className="admin-inset">{value}</p><div className="admin-buttons">
        <AdminButton tone="primary" onClick={()=>{
          if(name==="Material published")onGo("Modules");
          else if(name==="Assessment published")onGo("Assessments");
          else onCancel();
        }}>Done</AdminButton>
      </div></>;
  }
}

