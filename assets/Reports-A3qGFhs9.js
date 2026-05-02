import{n as e}from"./rolldown-runtime-jpDsebLB.js";import{n as t,p as n}from"./vendor-ChahFEjE.js";import{a as r,i,n as a,r as o,t as s}from"./index-DWF4kbmq.js";import{n as c,r as l,t as u}from"./helpers-Dj_Q-DcD.js";import{n as d}from"./Badges-AKAyvIoN.js";import{t as f}from"./Modal-5RF8jQvs.js";var p=e(n(),1),m=(e,t)=>{let{lang:n,project:r,projectName:i,t:a}=t,o=n===`ar`,s=new Date().toLocaleDateString(o?`ar-EG`:`en-US`);return`
    <!DOCTYPE html>
    <html lang="${n}" dir="${o?`rtl`:`ltr`}">
    <head>
      <meta charset="UTF-8">
      <title>${a(`reports`)} - ${i}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1a73e8; padding-bottom: 20px; margin-bottom: 30px; }
        .header-title { font-size: 28px; font-weight: bold; color: #1a73e8; }
        .header-info { text-align: ${o?`left`:`right`}; font-size: 14px; }
        
        .project-banner { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #dee2e6; }
        .project-banner h2 { margin: 0; font-size: 20px; color: #202124; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
        .stat-card { border: 1px solid #e0e0e0; padding: 15px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #1a73e8; display: block; }
        .stat-label { font-size: 12px; color: #5f6368; text-transform: uppercase; }

        .section { margin-bottom: 40px; page-break-inside: avoid; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px; color: #1a73e8; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
        th, td { border: 1px solid #e0e0e0; padding: 10px; text-align: ${o?`right`:`left`}; }
        th { background-color: #f1f3f4; font-weight: 600; color: #3c4043; }
        tr:nth-child(even) { background-color: #fafafa; }

        .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; display: inline-block; }
        .badge-success { background: #e6f4ea; color: #1e8e3e; }
        .badge-danger { background: #fce8e6; color: #d93025; }
        .badge-warning { background: #fef7e0; color: #f9ab00; }
        .badge-info { background: #e8f0fe; color: #1a73e8; }

        .footer { margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; display: flex; justify-content: space-between; font-size: 12px; color: #70757a; }
        
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="header-title">${a(`appName`)}</div>
          <div style="font-size: 14px; color: #5f6368;">Safety & Health Management System</div>
        </div>
        <div class="header-info">
          <div><strong>${a(`date`)}:</strong> ${s}</div>
          <div><strong>${a(`reports`)} ID:</strong> ${Math.random().toString(36).substr(2,9).toUpperCase()}</div>
        </div>
      </div>

      <div class="project-banner">
        <h2>${a(`project`)}: ${i}</h2>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">${e.permits.length}</span>
          <span class="stat-label">${a(`totalPermits`)}</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${e.notes.length}</span>
          <span class="stat-label">${a(`totalNotes`)}</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${e.incidents.length}</span>
          <span class="stat-label">${a(`totalIncidents`)}</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${e.tbt.length}</span>
          <span class="stat-label">${a(`totalTBT`)}</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${e.licenses.length}</span>
          <span class="stat-label">${a(`totalLicenses`)}</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${e.licenses.filter(e=>e.status===`valid`).length}</span>
          <span class="stat-label">${a(`valid`)} ${a(`licenses`)}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">${a(`permitsStatus`)}</div>
        <table>
          <thead>
            <tr>
              <th>${a(`type`)}</th>
              <th>${a(`project`)}</th>
              <th>${a(`location`)}</th>
              <th>${a(`date`)}</th>
              <th>${a(`status`)}</th>
            </tr>
          </thead>
          <tbody>
            ${e.permits.slice(0,10).map(e=>`
              <tr>
                <td>${a(e.type)}</td>
                <td>${e.project}</td>
                <td>${e.location||`-`}</td>
                <td>${c(e.date)}</td>
                <td><span class="badge ${e.status===`active`?`badge-success`:`badge-danger`}">${a(e.status)}</span></td>
              </tr>
            `).join(``)}
            ${e.permits.length>10?`<tr><td colspan="5" style="text-align: center; color: #888;">+ ${e.permits.length-10} more items...</td></tr>`:``}
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">${a(`incidentsManagement`)}</div>
        <table>
          <thead>
            <tr>
              <th>${a(`title`)}</th>
              <th>${a(`type`)}</th>
              <th>${a(`project`)}</th>
              <th>${a(`date`)}</th>
              <th>${a(`severity`)}</th>
            </tr>
          </thead>
          <tbody>
            ${e.incidents.length?e.incidents.slice(0,10).map(e=>`
              <tr>
                <td>${e.title||`-`}</td>
                <td>${a(e.type)}</td>
                <td>${e.project}</td>
                <td>${c(e.date)}</td>
                <td><span class="badge ${e.severity===`critical`?`badge-danger`:e.severity===`high`?`badge-warning`:`badge-info`}">${a(e.severity)}</span></td>
              </tr>
            `).join(``):`<tr><td colspan="5" style="text-align: center;">${a(`noData`)}</td></tr>`}
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">${a(`fieldNotes`)}</div>
        <table>
          <thead>
            <tr>
              <th>${a(`title`)}</th>
              <th>${a(`type`)}</th>
              <th>${a(`project`)}</th>
              <th>${a(`supervisor`)}</th>
              <th>${a(`status`)}</th>
            </tr>
          </thead>
          <tbody>
            ${e.notes.length?e.notes.slice(0,10).map(e=>`
              <tr>
                <td>${e.title||`-`}</td>
                <td>${a(e.type)}</td>
                <td>${e.project}</td>
                <td>${e.supervisor||`-`}</td>
                <td><span class="badge ${e.status===`closed`?`badge-success`:`badge-warning`}">${a(e.status)}</span></td>
              </tr>
            `).join(``):`<tr><td colspan="5" style="text-align: center;">${a(`noData`)}</td></tr>`}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <div>Generated by EHS Platform - Digital Safety Solutions</div>
        <div>Page 1 of 1</div>
      </div>

      <div class="no-print" style="position: fixed; bottom: 20px; right: 20px;">
        <button onclick="window.print()" style="padding: 12px 24px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
          🖨️ ${a(`print`)||`Print Report`}
        </button>
      </div>
    </body>
    </html>
  `},h=t();function g(){let{isManager:e,getUserProjects:t,projectsData:n,getProjectName:c}=i(),{lang:g}=o(),[_,v]=(0,p.useState)(!1),[y,b]=(0,p.useState)(`pdf`),[x,S]=(0,p.useState)(`all`),[C,w]=(0,p.useState)(`all`),[T,E]=(0,p.useState)(`all`),D=e=>{let t=a[g];return t&&t[e]||e},[O,k]=(0,p.useState)({permits:[],notes:[],incidents:[],tbt:[],licenses:[]}),[A,j]=(0,p.useState)(!0);(0,p.useEffect)(()=>{(async()=>{let n=t(),i=e(),{data:a}=await r.from(`permits`).select(`*`).in(`project`,n),{data:o}=await r.from(`notes`).select(`*`).in(`project`,n),{data:s}=i?await r.from(`incidents`).select(`*`):{data:[]},{data:c}=await r.from(`tbt_sessions`).select(`*`).in(`project`,n),{data:l}=await r.from(`licenses`).select(`*`).in(`project`,n);k({permits:a||[],notes:o||[],incidents:s||[],tbt:c||[],licenses:l||[]}),j(!1)})()},[e,t]);let M=e=>{b(e),v(!0)},N=e=>{e.preventDefault();let t=x===`all`?D(`allProj`):c(x,g),n=F(x,T);if(y===`pdf`){let e=m(n,{lang:g,project:x,projectName:t,t:D}),r=window.open(``,`_blank`);r.document.write(e),r.document.close()}else u([{Metric:D(`totalPermits`),Value:n.permits.length},{Metric:D(`totalNotes`),Value:n.notes.length},{Metric:D(`totalIncidents`),Value:n.incidents.length},{Metric:D(`totalTBT`),Value:n.tbt.length},{Metric:D(`totalLicenses`),Value:n.licenses.length}],`Report_${x}_${formatDate(new Date)}.csv`);l(`✅ ${D(`reportExported`)} (${y.toUpperCase()}) - ${t}`,`success`),v(!1)};if(A)return(0,h.jsx)(`div`,{style:{padding:`2rem`,textAlign:`center`},children:(0,h.jsx)(s,{})});let P=(e,t)=>t?Math.round(e/t*100):0;C===`all`?O.permits:O.permits.filter(e=>e.project===C),C===`all`?O.notes:O.notes.filter(e=>e.project===C),C===`all`?O.incidents:O.incidents.filter(e=>e.project===C),C===`all`?O.tbt:O.tbt.filter(e=>e.project===C),C===`all`?O.licenses:O.licenses.filter(e=>e.project===C);let F=(e,t)=>{let n=t=>e===`all`?t:t.filter(t=>t.project===e),r=e=>{if(t===`all`)return e;let n=new Date,r=new Date(n.getFullYear(),n.getMonth(),n.getDate());return e.filter(e=>{if(!e.date)return!1;let i=new Date(e.date);return t===`daily`?i>=r:t===`weekly`?i>=new Date(n.getTime()-10080*60*1e3):t===`monthly`?i>=new Date(n.getTime()-720*60*60*1e3):t===`yearly`?i>=new Date(n.getTime()-365*24*60*60*1e3):!0})};return{permits:r(n(O.permits)),notes:r(n(O.notes)),incidents:r(n(O.incidents)),tbt:r(n(O.tbt)),licenses:r(n(O.licenses))}},I=F(C,T);return(0,h.jsxs)(`div`,{children:[(0,h.jsxs)(`div`,{className:`page-header`,children:[(0,h.jsxs)(`div`,{children:[(0,h.jsxs)(`div`,{className:`page-title`,children:[(0,h.jsx)(`span`,{className:`icon`,children:`📈`}),` `,D(`reports`)]}),(0,h.jsxs)(`div`,{style:{marginTop:`8px`,display:`flex`,gap:`8px`},children:[(0,h.jsxs)(`select`,{className:`form-control`,value:C,onChange:e=>{w(e.target.value),S(e.target.value)},style:{padding:`6px 12px`,borderRadius:`6px`,backgroundColor:`var(--surface)`,color:`var(--text2)`,minWidth:`140px`},children:[(0,h.jsx)(`option`,{value:`all`,children:D(`allProjects`)}),n.map(e=>(0,h.jsx)(`option`,{value:e.key,children:g===`ar`?e.name_ar:e.name_en},e.key))]}),(0,h.jsxs)(`select`,{className:`form-control`,value:T,onChange:e=>E(e.target.value),style:{padding:`6px 12px`,borderRadius:`6px`,backgroundColor:`var(--surface)`,color:`var(--text2)`,minWidth:`140px`},children:[(0,h.jsx)(`option`,{value:`all`,children:D(`allTime`)}),(0,h.jsx)(`option`,{value:`daily`,children:D(`daily`)}),(0,h.jsx)(`option`,{value:`weekly`,children:D(`weekly`)}),(0,h.jsx)(`option`,{value:`monthly`,children:D(`monthly`)}),(0,h.jsx)(`option`,{value:`yearly`,children:D(`yearly`)})]})]})]}),e()&&(0,h.jsxs)(`div`,{style:{display:`flex`,gap:`8px`},children:[(0,h.jsxs)(`button`,{className:`btn btn-danger`,onClick:()=>M(`pdf`),children:[`📄 `,D(`exportPDF`)]}),(0,h.jsxs)(`button`,{className:`btn btn-success`,onClick:()=>M(`excel`),children:[`📊 `,D(`exportExcel`)]})]})]}),(0,h.jsxs)(`div`,{className:`report-grid`,children:[(0,h.jsxs)(`div`,{className:`report-stat`,children:[(0,h.jsx)(`div`,{className:`report-stat-num`,children:I.permits.length}),(0,h.jsx)(`div`,{className:`report-stat-label`,children:D(`totalPermits`)})]}),(0,h.jsxs)(`div`,{className:`report-stat`,children:[(0,h.jsx)(`div`,{className:`report-stat-num`,children:I.notes.length}),(0,h.jsx)(`div`,{className:`report-stat-label`,children:D(`totalNotes`)})]}),(0,h.jsxs)(`div`,{className:`report-stat`,children:[(0,h.jsx)(`div`,{className:`report-stat-num`,children:I.incidents.length}),(0,h.jsx)(`div`,{className:`report-stat-label`,children:D(`totalIncidents`)})]}),(0,h.jsxs)(`div`,{className:`report-stat`,children:[(0,h.jsx)(`div`,{className:`report-stat-num`,children:I.tbt.length}),(0,h.jsx)(`div`,{className:`report-stat-label`,children:D(`totalTBT`)})]}),(0,h.jsxs)(`div`,{className:`report-stat`,children:[(0,h.jsx)(`div`,{className:`report-stat-num`,children:I.licenses.length}),(0,h.jsx)(`div`,{className:`report-stat-label`,children:D(`totalLicenses`)})]}),(0,h.jsxs)(`div`,{className:`report-stat`,children:[(0,h.jsx)(`div`,{className:`report-stat-num`,children:I.licenses.filter(e=>e.status===`valid`).length}),(0,h.jsxs)(`div`,{className:`report-stat-label`,children:[D(`valid`),` `,D(`licenses`)]})]})]}),(0,h.jsxs)(`div`,{className:`report-details-grid`,children:[(0,h.jsxs)(`div`,{className:`card`,children:[(0,h.jsxs)(`div`,{className:`card-title`,style:{marginBottom:`14px`},children:[`📋 `,D(`permitsStatus`)]}),[`active`,`closed`].map(e=>{let t=I.permits.filter(t=>t.status===e).length,n=P(t,I.permits.length);return(0,h.jsxs)(`div`,{style:{marginBottom:`10px`},children:[(0,h.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,fontSize:`13px`,marginBottom:`4px`},children:[(0,h.jsx)(d,{status:e}),(0,h.jsxs)(`span`,{style:{fontWeight:700},children:[t,` (`,n,`%)`]})]}),(0,h.jsx)(`div`,{style:{background:`var(--bg3)`,borderRadius:`4px`,height:`8px`},children:(0,h.jsx)(`div`,{style:{background:`var(--accent)`,height:`100%`,borderRadius:`4px`,width:`${n}%`}})})]},e)})]}),(0,h.jsxs)(`div`,{className:`card`,children:[(0,h.jsxs)(`div`,{className:`card-title`,style:{marginBottom:`14px`},children:[`📝 `,D(`notesStats`)]}),[{type:`unsafeAct`,label:D(`unsafeActCount`)},{type:`unsafeCondition`,label:D(`unsafeCondCount`)}].map(e=>{let t=I.notes.filter(t=>t.type===e.type).length,n=P(t,I.notes.length);return(0,h.jsxs)(`div`,{style:{marginBottom:`10px`},children:[(0,h.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,fontSize:`13px`,marginBottom:`4px`},children:[(0,h.jsx)(`span`,{children:e.label}),(0,h.jsxs)(`span`,{style:{fontWeight:700},children:[t,` (`,n,`%)`]})]}),(0,h.jsx)(`div`,{style:{background:`var(--bg3)`,borderRadius:`4px`,height:`8px`},children:(0,h.jsx)(`div`,{style:{background:e.type===`unsafeAct`?`var(--danger)`:`var(--warning)`,height:`100%`,borderRadius:`4px`,width:`${n}%`}})})]},e.type)})]}),(0,h.jsxs)(`div`,{className:`card`,children:[(0,h.jsxs)(`div`,{className:`card-title`,style:{marginBottom:`14px`},children:[`⚠️ `,D(`incidentsByType`)]}),[`injury`,`electrical`,`slip`,`fall`,`fire`,`suffocation`].map(e=>{let t=I.incidents.filter(t=>t.type===e).length;return t?(0,h.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,padding:`6px 0`,borderBottom:`1px solid var(--border)`},children:[(0,h.jsx)(`span`,{style:{fontSize:`13px`},children:{injury:D(`injury`),electrical:D(`electrical`),slip:D(`slip`),fall:D(`fall`),fire:D(`fire`),suffocation:D(`suffocation`)}[e]}),(0,h.jsx)(`span`,{className:`badge-status badge-high`,children:t})]},e):null}),!I.incidents.length&&(0,h.jsx)(`div`,{style:{color:`var(--text3)`,padding:`16px 0`},children:D(`noData`)})]}),(0,h.jsxs)(`div`,{className:`card`,children:[(0,h.jsxs)(`div`,{className:`card-title`,style:{marginBottom:`14px`},children:[`🏅 `,D(`licenses`)]}),[`valid`,`expiring`,`expired`].map(e=>{let t=I.licenses.filter(t=>t.status===e).length,n=P(t,I.licenses.length);return(0,h.jsxs)(`div`,{style:{marginBottom:`10px`},children:[(0,h.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,fontSize:`13px`,marginBottom:`4px`},children:[(0,h.jsx)(d,{status:e}),(0,h.jsxs)(`span`,{style:{fontWeight:700},children:[t,` (`,n,`%)`]})]}),(0,h.jsx)(`div`,{style:{background:`var(--bg3)`,borderRadius:`4px`,height:`8px`},children:(0,h.jsx)(`div`,{style:{background:{valid:`var(--success)`,expiring:`var(--warning)`,expired:`var(--danger)`}[e],height:`100%`,borderRadius:`4px`,width:`${n}%`}})})]},e)})]})]}),(0,h.jsx)(f,{isOpen:_,onClose:()=>v(!1),title:D(`exportOptions`),confirmText:D(`export`),children:(0,h.jsxs)(`form`,{id:`modal-form`,onSubmit:N,children:[(0,h.jsxs)(`div`,{className:`form-group`,children:[(0,h.jsx)(`label`,{style:{display:`block`,marginBottom:`8px`},children:D(`selectProjectForExport`)||`Select Project for Export`}),(0,h.jsxs)(`select`,{className:`form-control`,value:x,onChange:e=>S(e.target.value),style:{width:`100%`,padding:`10px`,borderRadius:`8px`,border:`1px solid var(--border)`,background:`var(--bg2)`,color:`var(--text)`},children:[(0,h.jsx)(`option`,{value:`all`,children:D(`allProj`)}),n.map(e=>(0,h.jsx)(`option`,{value:e.key,children:g===`ar`?e.name_ar:e.name_en},e.key))]})]}),(0,h.jsxs)(`div`,{style:{marginTop:`16px`,padding:`12px`,background:`var(--bg3)`,borderRadius:`8px`,fontSize:`14px`,color:`var(--text2)`},children:[`ℹ️ `,D(`exportTypeNote`)||`Exporting as`,` `,(0,h.jsx)(`strong`,{children:y.toUpperCase()})]})]})})]})}export{g as default};