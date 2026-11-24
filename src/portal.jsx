const State = React.createContext(null);
const START = "264:16";
const SIGNUP = "264:90";
const HOME = "264:257";
const CLASSES = "264:398";
const EXAM = "264:1139";
const answers = ["264:1196", "264:1200", "264:1204", "264:1209"];
const modules = new Set(["264:330","264:340","264:578","264:588","264:1697","264:1729"]);
const routeMap = Object.fromEntries(PROTOTYPE.flatMap(([, controls]) =>
  controls.flatMap(([id, , reactions]) => reactions.filter(([trigger]) => trigger === "ON_CLICK").map(([, actions]) => [id, actions[0]]))
));
const specialControls = new Set([
  "264:1642","264:1644","264:1648","264:1649","264:1213","264:1224","264:1228",
  "264:638","264:1453",...answers,...modules
]);
const contentText = value => React.Children.toArray(value).map(child =>
  typeof child === "string" || typeof child === "number" ? child : child.props ? contentText(child.props.children ?? child.props.slots) : ""
).join(" ").trim();

function Field({ name, children, className, id, isClassCode }) {
  const sample = contentText(children);
  const isPassword = name === "Password Input" || /•/.test(sample);
  const common = { className:"field-control", "aria-label": isClassCode ? "Class code" : isPassword ? "Password or security answer" : sample || "Input" };
  return <div className={className+" field-frame"} data-node-id={id}>
    {name === "Dropdown" ? <select {...common} defaultValue="">
      <option value="" disabled>{sample || "Select a security question"}</option>
      <option>What was your childhood nickname?</option>
      <option>What was the name of your first school?</option>
      <option>What is a place you remember visiting?</option>
    </select> : <input {...common} type={isPassword ? "password" : "text"} placeholder={isClassCode ? "Enter class code" : isPassword && /•/.test(sample) ? "Enter a value" : sample}/>}
  </div>;
}

function WorksheetFiles() {
  const { page, worksheets, setWorksheets } = React.useContext(State);
  const entry = worksheets[page];
  const update = value => setWorksheets(items => ({ ...items, [page]:value }));
  if(entry?.sent) return <div className="worksheet-sent"><strong>Worksheet submitted in this demo</strong><span>{entry.file.name}</span></div>;
  return <div className="worksheet-files">
    {entry?.file ? <>
      <strong className="worksheet-filename">{entry.file.name}</strong><span>1 of 1 file attached</span>
      <button type="button" className="worksheet-remove" onClick={() => update(null)}>Remove file</button>
      <button type="button" onClick={() => update({...entry,sent:true})}>Submit worksheet</button>
    </> : <>
      <span>Attach one file to submit your worksheet.</span>
      <label className="worksheet-choose">
        Choose file<input type="file" className="visually-hidden" onChange={e => { const file=e.target.files[0]; if(file) update({file,sent:false}); }}/>
      </label>
    </>}
  </div>;
}

function DesignNode({ tag, props, slots }) {
  const state = React.useContext(State);
  const { page, action, seconds, answer, flag, confirmed, cleared, unread, filter } = state;
  const id=props["data-node-id"];
  const name=props["data-name"];
  if(name==="dark simplified w/ bg" && page!==START && page!==SIGNUP){
    return React.createElement("button", {
      ...props,
      type: "button",
      className: props.className+" portal-home-button",
      "aria-label": "Portal home",
      onClick: state.goHome,
    }, ...React.Children.toArray(slots));
  }
  if(name==="No attachment") return <WorksheetFiles/>;
  if(name==="Text Input"||name==="Password Input"||name==="Dropdown"||name==="Sample input"){
    return <Field id={id} name={name} className={props.className} isClassCode={id==="264:430"||id==="264:1980"}>{slots}</Field>;
  }
  if(name==="Checkbox") return <input type="checkbox" aria-label={page===START?"Remember me":"Accept terms"} className="portal-checkbox" data-node-id={id}/>;
  if(name==="Reason input" || /textarea/i.test(name||"")) return <textarea aria-label="Reason" placeholder={contentText(slots)} className="portal-reason"/>;
  if(id==="264:1001"){
    const sample=contentText(slots);
    return React.createElement("input", {
      "data-node-id":id,
      className:"code-input",
      "aria-label":"Exam code",
      placeholder:sample
    });
  }
  if(page==="264:1612"){
    if(id==="264:1650"&&(cleared||(filter==="unread"&&!unread))) return <div className="notification-empty">No {filter==="unread"?"unread ":""}notifications</div>;
    if(id==="264:1700"&&(cleared||filter==="unread")) return null;
    if(id==="264:1646"||id==="264:1653") slots=id==="264:1646"?String(unread):unread+" unread";
    if(id==="264:1638"&&!unread) slots=cleared?"New updates from your class will appear here.":"You have no unread notifications.";
    if(name==="Unread indicator"&&!unread) return null;
    if(id==="264:1648"||id==="264:1649") props={...props,disabled:cleared};
    if((id==="264:1642"&&filter==="all")||(id==="264:1644"&&filter==="unread")) props={...props,className:props.className+" notification-filter-active","aria-pressed":true};
  }
  if(page===EXAM){
    if(id==="264:1186") slots=Math.floor(seconds/60)+":"+String(seconds%60).padStart(2,"0")+" remaining";
    if(id==="264:1216"&&flag) slots="Flagged for review";
    if(answers.includes(id)) props={...props,className:props.className+(id===answer?" exam-answer-selected":" exam-answer-idle"),"aria-pressed":id===answer};
    if(name==="Radio control"){
      const owner={"264:1197":answers[0],"264:1201":answers[1],"264:1205":answers[2],"264:1210":answers[3]}[id];
      props={...props,className:"exam-radio "+(answer===owner?"exam-radio-selected":"exam-radio-idle")};
      slots=[];
    }
  }
  if(id==="264:1454"&&!confirmed) slots=[];
  if(id==="264:1453") props={...props,"aria-pressed":confirmed};

  if(routeMap[id]||specialControls.has(id)){
    const native=tag==="button";
    props={...props,className:(props.className||"")+" portal-action", "aria-label":props["aria-label"]||contentText(slots)||name||"Open", onClick:e=>{e.preventDefault();e.stopPropagation();action(id,e.currentTarget);}};
    if(native) props.type="button";
    else {
      props.role="button"; props.tabIndex=0;
      props.onKeyDown=e=>{if(e.target===e.currentTarget&&(e.key==="Enter"||e.key===" ")){e.preventDefault();e.stopPropagation();action(id,e.currentTarget);}};
    }
  }
  return React.createElement(tag,props,...React.Children.toArray(slots));
}

function H(tag, props, ...slots) {
  const id=props?.["data-node-id"];
  return id ? React.createElement(DesignNode,{key:props.key,tag,props,slots}) : React.createElement(tag,props,...slots);
}

function Shell() {
  const [page,setPage]=React.useState(START);
  const [enteredFromTab,setEnteredFromTab]=React.useState(false);
  const [modal,setModal]=React.useState(null);
  const [prior,setPrior]=React.useState(HOME);
  const [notice,setNotice]=React.useState("");
  const [worksheets,setWorksheets]=React.useState({});
  const [unread,setUnread]=React.useState(3);
  const [cleared,setCleared]=React.useState(false);
  const [filter,setFilter]=React.useState("all");
  const [archived,setArchived]=React.useState(false);
  const [answer,setAnswer]=React.useState(answers[2]);
  const [flag,setFlag]=React.useState(false);
  const [confirmed,setConfirmed]=React.useState(true);
  const [deadline,setDeadline]=React.useState(null);
  const [seconds,setSeconds]=React.useState(1200);
  const dialog=React.useRef();
  const evidence=React.useRef(null);

  React.useEffect(()=>{
    if(modal && !dialog.current.open) dialog.current.showModal();
    if(!modal && dialog.current.open) dialog.current.close();
  },[modal]);
  React.useEffect(()=>{
    if(!notice)return;
    const id=setTimeout(()=>setNotice(""),3800);return()=>clearTimeout(id);
  },[notice]);
  React.useEffect(()=>{
    if(!deadline)return;
    const tick=()=>setSeconds(Math.max(0,Math.ceil((deadline-Date.now())/1000)));
    tick();const id=setInterval(tick,1000);return()=>clearInterval(id);
  },[deadline]);

  function navigate(target, fromTab=false){
    if(target===CLASSES&&archived)target="264:1948";
    if(target==="264:1612"&&page!==target)setPrior(page);
    setModal(null);
    if(target===page){window.scrollTo(0,0);return;}
    setEnteredFromTab(fromTab);
    setPage(target);window.scrollTo(0,0);
  }

  function action(id,node){
    if(modules.has(id)){setNotice("This study module file has yet to be added.");return;}
    if(id==="264:432"||id==="264:1982"){
      if(!document.querySelector('[aria-label="Class code"]')?.value.trim()){setNotice("Enter a class code first.");return;}
    }
    if(id==="264:1642"||id==="264:1644"){setFilter(id==="264:1642"?"all":"unread");return;}
    if(id==="264:1648"){setUnread(0);return;}
    if(id==="264:1649"){setModal("clear");return;}
    if(id==="264:638"){evidence.current.click();return;}
    if(answers.includes(id)){setAnswer(id);return;}
    if(id==="264:1213"){setFlag(!flag);return;}
    if(id==="264:1224"||id==="264:1228"){setNotice("This prototype includes one sample examination question.");return;}
    if(id==="264:1453"){setConfirmed(!confirmed);return;}
    if(id==="264:1461"&&!confirmed){setNotice("Confirm that you reviewed your answers before submitting.");return;}
    if(id==="264:1461")setDeadline(null);
    if(id==="264:1006"&&!deadline)setDeadline(Date.now()+20*60*1000);
    if(id==="264:1932"){setArchived(true);navigate("264:1948");return;}
    if(id==="264:1998"){setArchived(false);setEnteredFromTab(false);setPage(CLASSES);setModal(null);window.scrollTo(0,0);return;}
    const [type,nav,target]=routeMap[id]||[];
    if(type==="CLOSE"){setModal(null);return;}
    if(type==="BACK"){navigate(prior);return;}
    if(nav==="SCROLL_TO"){const dest=document.querySelector('[data-node-id="'+target+'"]');dest?.scrollIntoView({block:"start"});return;}
    if(!target||!SCREENS[target])return;
    if(nav==="OVERLAY"||nav==="SWAP"){setModal(target);return;}
    const fromTab=Boolean(node.closest('[data-name="Navigation"], [data-name="Bottom navigation"]'));
    navigate(target,fromTab);
  }

  const Screen=SCREENS[page];
  const Overlay=SCREENS[modal];
  const context={page,action,goHome:()=>navigate(HOME,true),seconds,answer,flag,confirmed,cleared,unread,filter,worksheets,setWorksheets};
  return <State.Provider value={context}>
    <div className="portal-shell">
      <main className={enteredFromTab ? "portal-screen portal-screen-tab-entry" : "portal-screen"} data-screen={page}>
        <Screen key={page}/>
      </main>
    </div>
    <dialog className="portal-dialog" ref={dialog} onCancel={()=>setModal(null)} aria-label="Portal dialog">
      {Overlay&&<div className="portal-overlay"><Overlay key={modal}/></div>}
      {modal==="clear"&&<div className="notification-clear-dialog">
        <h2 className="dialog-title">Clear all notifications?</h2>
        <p className="dialog-description">This clears the notification list in this preview.</p>
        <div className="dialog-actions"><button onClick={()=>setModal(null)}>Cancel</button><button onClick={()=>{setCleared(true);setUnread(0);setModal(null);}}>Clear all</button></div>
      </div>}
      <input type="file" className="visually-hidden" ref={evidence} tabIndex={-1} accept=".pdf,.jpg,.jpeg,.png" onChange={e=>{const file=e.target.files[0];if(file)setNotice("Attachment selected: "+file.name);}}/>
    </dialog>
    {notice&&<div className="portal-status" role="status">{notice}</div>}
  </State.Provider>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<Shell/>);
