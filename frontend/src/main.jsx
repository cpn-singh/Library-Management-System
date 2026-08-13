import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  useNavigate,
  NavLink,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./styles.css";
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
async function req(path, opt = {}) {
  const h = { "Content-Type": "application/json", ...(opt.headers || {}) },
    t = localStorage.getItem("access_token");
  if (t) h.Authorization = `Bearer ${t}`;
  const r = await fetch(API + path, { ...opt, headers: h });
  let b = {};
  try {
    b = await r.json();
  } catch {}
  if (!r.ok) {
    if (r.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    }
    throw Error(b.error || b.message || `Request failed (${r.status})`);
  }
  return b;
}
const api = {
  login: (d) => req("/auth/login", { method: "POST", body: JSON.stringify(d) }),
  register: (d) =>
    req("/auth/register", { method: "POST", body: JSON.stringify(d) }),
  books: (q) => req("/books" + (q ? "?" + q : "")),
  bookCreate: (d) => req("/books", { method: "POST", body: JSON.stringify(d) }),
  bookUpdate: (id, d) =>
    req("/books/" + id, { method: "PUT", body: JSON.stringify(d) }),
  bookDelete: (id) => req("/books/" + id, { method: "DELETE" }),
  authors: () => req("/authors"),
  authorCreate: (d) =>
    req("/authors", { method: "POST", body: JSON.stringify(d) }),
  authorUpdate: (id, d) =>
    req("/authors/" + id, { method: "PUT", body: JSON.stringify(d) }),
  authorDelete: (id) => req("/authors/" + id, { method: "DELETE" }),
  categories: () => req("/categories"),
  categoryCreate: (d) =>
    req("/categories", { method: "POST", body: JSON.stringify(d) }),
  categoryUpdate: (id, d) =>
    req("/categories/" + id, { method: "PUT", body: JSON.stringify(d) }),
  categoryDelete: (id) => req("/categories/" + id, { method: "DELETE" }),
  members: () => req("/members"),
  memberCreate: (d) =>
    req("/members", { method: "POST", body: JSON.stringify(d) }),
  memberUpdate: (id, d) =>
    req("/members/" + id, { method: "PUT", body: JSON.stringify(d) }),
  memberDelete: (id) => req("/members/" + id, { method: "DELETE" }),
  issue: (d) =>
    req("/loans/issue", { method: "POST", body: JSON.stringify(d) }),
  ret: (id) => req("/loans/" + id + "/return", { method: "POST" }),
  overdue: () => req("/loans/overdue"),
};
function Protected({ children }) {
  return localStorage.getItem("access_token") ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
}
function Layout() {
  const nav = useNavigate(),
    u = JSON.parse(localStorage.getItem("user") || "null");
  function out() {
    localStorage.clear();
    nav("/login");
  }
  return (
    <div className="shell">
      <aside>
        <div className="brand">
          <b>L</b>
          <span>
            <strong>Library</strong>
            <small>Management</small>
          </span>
        </div>
        <nav>
          {[
            ["/", "Dashboard"],
            ["/books", "Books"],
            ["/authors", "Authors"],
            ["/categories", "Categories"],
            ["/members", "Members"],
            ["/loans", "Loans"],
          ].map((x) => (
            <NavLink
              end={x[0] === "/"}
              className={({ isActive }) => (isActive ? "active" : "")}
              to={x[0]}
              key={x[0]}
            >
              {x[1]}
            </NavLink>
          ))}
        </nav>
        <div className="user">
          <div className="avatar">{u?.name?.[0]?.toUpperCase() || "U"}</div>
          <div>
            <b>{u?.name}</b>
            <small>{u?.role}</small>
          </div>
          <button onClick={out}>Logout</button>
        </div>
      </aside>
      <main>
        {
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/books" element={<Books />} />
            <Route path="/authors" element={<Crud type="authors" />} />
            <Route path="/categories" element={<Crud type="categories" />} />
            <Route path="/members" element={<Crud type="members" />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        }
      </main>
    </div>
  );
}
function Login({ register = false }) {
  const nav = useNavigate(),
    [f, setF] = useState({
      name: "",
      email: "",
      password: "",
      role: "librarian",
    }),
    [e, setE] = useState("");
  async function sub(x) {
    x.preventDefault();
    try {
      if (register) {
        await api.register(f);
        nav("/login");
      } else {
        let r = await api.login({ email: f.email, password: f.password });
        localStorage.setItem("access_token", r.data.access_token);
        localStorage.setItem("user", JSON.stringify(r.data.user));
        nav("/");
      }
    } catch (z) {
      setE(z.message);
    }
  }
  return (
    <div className="auth">
      <form onSubmit={sub} className="card authcard form">
        <h1>{register ? "Create staff account" : "Welcome back"}</h1>
        <p>
          {register
            ? "Register an admin or librarian."
            : "Sign in to manage your library."}
        </p>
        {e && <div className="err">{e}</div>}
        {register && (
          <label>
            Name
            <input
              required
              value={f.name}
              onChange={(x) => setF({ ...f, name: x.target.value })}
            />
          </label>
        )}
        <label>
          Email
          <input
            type="email"
            required
            value={f.email}
            onChange={(x) => setF({ ...f, email: x.target.value })}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            value={f.password}
            onChange={(x) => setF({ ...f, password: x.target.value })}
          />
        </label>
        {register && (
          <label>
            Role
            <select
              value={f.role}
              onChange={(x) => setF({ ...f, role: x.target.value })}
            >
              <option value="librarian">Librarian</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        )}
        <button className="primary">
          {register ? "Create account" : "Sign in"}
        </button>
        <p className="center">
          {register ? "Already have an account? " : "Need an account? "}
          <a onClick={() => nav(register ? "/login" : "/register")}>
            {register ? "Sign in" : "Create one"}
          </a>
        </p>
      </form>
    </div>
  );
}
function Head({ title, sub, action }) {
  return (
    <header>
      <div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {action}
    </header>
  );
}
function Dashboard() {
  const [d, setD] = useState({
    books: 0,
    authors: 0,
    categories: 0,
    members: 0,
    overdue: 0,
  });
  useEffect(() => {
    Promise.all([
      api.books("per_page=1"),
      api.authors(),
      api.categories(),
      api.members(),
      api.overdue(),
    ])
      .then(([b, a, c, m, o]) =>
        setD({
          books: b.data?.total ?? b.total ?? 0,
          authors: a.data?.length || 0,
          categories: c.data?.length || 0,
          members: m.data?.length || 0,
          overdue: o.data?.length || 0,
        }),
      )
      .catch(() => {});
  }, []);
  return (
    <>
      <Head title="Dashboard" sub="Overview of your library." />
      <div className="stats">
        {[
          ["Books", d.books, "📚"],
          ["Authors", d.authors, "✍️"],
          ["Categories", d.categories, "🏷️"],
          ["Members", d.members, "👥"],
          ["Overdue", d.overdue, "⏰"],
        ].map((x) => (
          <div className="stat card" key={x[0]}>
            <i>{x[2]}</i>
            <span>{x[0]}</span>
            <b>{x[1]}</b>
          </div>
        ))}
      </div>
      <div className="card welcome">
        <h2>Library Management System</h2>
        <p>
          Use the sidebar to manage books, authors, categories, members and
          loans.
        </p>
      </div>
    </>
  );
}
function Modal({ title, close, children }) {
  return (
    <div className="backdrop">
      <div className="modal">
        <div className="modalhead">
          <h2>{title}</h2>
          <button onClick={close}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Books() {
  const [b, setB] = useState([]),
    [a, setA] = useState([]),
    [c, setC] = useState([]),
    [q, setQ] = useState(""),
    [modal, setM] = useState(false),
    [edit, setEdit] = useState(null),
    [err, setErr] = useState("");
  async function load() {
    try {
      let [x, y, z] = await Promise.all([
        api.books(
          "per_page=100" + (q ? "&title=" + encodeURIComponent(q) : ""),
        ),
        api.authors(),
        api.categories(),
      ]);
      setB(x.data?.books || []);
      setA(y.data || []);
      setC(z.data || []);
    } catch (e) {
      setErr(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function del(id) {
    if (!confirm("Delete this book?")) return;
    try {
      await api.bookDelete(id);
      load();
    } catch (e) {
      setErr(e.message);
    }
  }
  return (
    <>
      <Head
        title="Books"
        sub="Search and manage books."
        action={
          <button
            className="primary"
            onClick={() => {
              setEdit(null);
              setM(true);
            }}
          >
            + Add book
          </button>
        }
      />
      {err && <div className="err">{err}</div>}
      <div className="toolbar">
        <input
          placeholder="Search title..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
        <button onClick={load}>Search</button>
      </div>
      <div className="card table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>ISBN</th>
              <th>Author</th>
              <th>Category</th>
              <th>Copies</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {b.map((x) => (
              <tr key={x.id}>
                <td>
                  <b>{x.title}</b>
                </td>
                <td>{x.isbn}</td>
                <td>{x.author?.name || x.author}</td>
                <td>{x.category?.name || x.category}</td>
                <td>
                  {x.available_copies}/{x.total_copies}
                </td>
                <td>
                  <button
                    className="link"
                    onClick={() => {
                      setEdit(x);
                      setM(true);
                    }}
                  >
                    Edit
                  </button>
                  <button className="danger" onClick={() => del(x.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!b.length && <div className="empty">No books found.</div>}
      </div>
      {modal && (
        <BookModal
          book={edit}
          authors={a}
          categories={c}
          close={() => setM(false)}
          saved={() => {
            setM(false);
            load();
          }}
        />
      )}
    </>
  );
}
function BookModal({ book, authors, categories, close, saved }) {
  const [f, setF] = useState({
      title: book?.title || "",
      isbn: book?.isbn || "",
      author_id: book?.author_id || "",
      category_id: book?.category_id || "",
      total_copies: book?.total_copies || 1,
    }),
    [e, setE] = useState("");
  async function sub(x) {
    x.preventDefault();
    try {
      let d = {
        ...f,
        author_id: +f.author_id,
        category_id: +f.category_id,
        total_copies: +f.total_copies,
      };
      book ? await api.bookUpdate(book.id, d) : await api.bookCreate(d);
      saved();
    } catch (z) {
      setE(z.message);
    }
  }
  return (
    <Modal title={book ? "Edit book" : "Add book"} close={close}>
      {e && <div className="err">{e}</div>}
      <form className="form" onSubmit={sub}>
        <label>
          Title
          <input
            required
            value={f.title}
            onChange={(e) => setF({ ...f, title: e.target.value })}
          />
        </label>
        <label>
          ISBN
          <input
            required
            value={f.isbn}
            onChange={(e) => setF({ ...f, isbn: e.target.value })}
          />
        </label>
        <label>
          Author
          <select
            required
            value={f.author_id}
            onChange={(e) => setF({ ...f, author_id: e.target.value })}
          >
            <option value="">Select</option>
            {authors.map((x) => (
              <option value={x.id} key={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Category
          <select
            required
            value={f.category_id}
            onChange={(e) => setF({ ...f, category_id: e.target.value })}
          >
            <option value="">Select</option>
            {categories.map((x) => (
              <option value={x.id} key={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Total copies
          <input
            type="number"
            min="1"
            required
            value={f.total_copies}
            onChange={(e) => setF({ ...f, total_copies: e.target.value })}
          />
        </label>
        <button className="primary">Save book</button>
      </form>
    </Modal>
  );
}
const cfg = {
  authors: {
    title: "Authors",
    sing: "Author",
    get: api.authors,
    create: api.authorCreate,
    update: api.authorUpdate,
    remove: api.authorDelete,
    fields: ["name", "bio"],
  },
  categories: {
    title: "Categories",
    sing: "Category",
    get: api.categories,
    create: api.categoryCreate,
    update: api.categoryUpdate,
    remove: api.categoryDelete,
    fields: ["name"],
  },
  members: {
    title: "Members",
    sing: "Member",
    get: api.members,
    create: api.memberCreate,
    update: api.memberUpdate,
    remove: api.memberDelete,
    fields: ["name", "email", "phone"],
  },
};
function Crud({ type }) {
  let c = cfg[type],
    [items, setI] = useState([]),
    [edit, setE] = useState(null),
    [m, setM] = useState(false),
    [err, setErr] = useState("");
  async function load() {
    try {
      let r = await c.get();
      setI(r.data || []);
    } catch (e) {
      setErr(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function del(id) {
    if (!confirm("Delete this item?")) return;
    try {
      await c.remove(id);
      load();
    } catch (e) {
      setErr(e.message);
    }
  }
  return (
    <>
      <Head
        title={c.title}
        sub={"Manage " + type + "."}
        action={
          <button
            className="primary"
            onClick={() => {
              setE(null);
              setM(true);
            }}
          >
            + Add {c.sing}
          </button>
        }
      />
      {err && <div className="err">{err}</div>}
      <div className="card table">
        <table>
          <thead>
            <tr>
              {c.fields.map((x) => (
                <th key={x}>{x}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x.id}>
                {c.fields.map((k) => (
                  <td key={k}>{x[k] || "—"}</td>
                ))}
                <td>
                  <button
                    className="link"
                    onClick={() => {
                      setE(x);
                      setM(true);
                    }}
                  >
                    Edit
                  </button>
                  <button className="danger" onClick={() => del(x.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <div className="empty">No records found.</div>}
      </div>
      {m && (
        <CrudModal
          config={c}
          item={edit}
          close={() => setM(false)}
          saved={() => {
            setM(false);
            load();
          }}
        />
      )}
    </>
  );
}
function CrudModal({ config: c, item, close, saved }) {
  const [f, setF] = useState(
      Object.fromEntries(c.fields.map((k) => [k, item?.[k] || ""])),
    ),
    [e, setE] = useState("");
  async function sub(x) {
    x.preventDefault();
    try {
      item ? await c.update(item.id, f) : await c.create(f);
      saved();
    } catch (z) {
      setE(z.message);
    }
  }
  return (
    <Modal title={(item ? "Edit " : "Add ") + c.sing} close={close}>
      {e && <div className="err">{e}</div>}
      <form className="form" onSubmit={sub}>
        {c.fields.map((k) => (
          <label key={k}>
            {k}
            <input
              required={k !== "phone"}
              value={f[k]}
              onChange={(e) => setF({ ...f, [k]: e.target.value })}
            />
          </label>
        ))}
        <button className="primary">Save</button>
      </form>
    </Modal>
  );
}
function Loans() {
  const [o, setO] = useState([]),
    [m, setM] = useState([]),
    [b, setB] = useState([]),
    [f, setF] = useState({ book_id: "", member_id: "" }),
    [msg, setMsg] = useState(""),
    [err, setErr] = useState("");
  async function load() {
    try {
      let [x, y, z] = await Promise.all([
        api.overdue(),
        api.members(),
        api.books("per_page=100"),
      ]);
      setO(x.data || []);
      setM(y.data || []);
      setB(z.data?.books || []);
    } catch (e) {
      setErr(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function issue(e) {
    e.preventDefault();
    try {
      let r = await api.issue({ book_id: +f.book_id, member_id: +f.member_id });
      setMsg(r.message);
      setF({ book_id: "", member_id: "" });
      load();
    } catch (e) {
      setErr(e.message);
    }
  }
  async function ret(id) {
    try {
      let r = await api.ret(id);
      setMsg(r.message);
      load();
    } catch (e) {
      setErr(e.message);
    }
  }
  return (
    <>
      <Head title="Loans" sub="Issue, return and monitor overdue books." />
      {err && <div className="err">{err}</div>}
      {msg && <div className="ok">{msg}</div>}
      <div className="twocol">
        <div className="card">
          <h2>Issue a book</h2>
          <form className="form" onSubmit={issue}>
            <label>
              Book
              <select
                required
                value={f.book_id}
                onChange={(e) => setF({ ...f, book_id: e.target.value })}
              >
                <option value="">Select available book</option>
                {b
                  .filter((x) => x.available_copies > 0)
                  .map((x) => (
                    <option value={x.id} key={x.id}>
                      {x.title} ({x.available_copies})
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Member
              <select
                required
                value={f.member_id}
                onChange={(e) => setF({ ...f, member_id: e.target.value })}
              >
                <option value="">Select member</option>
                {m.map((x) => (
                  <option value={x.id} key={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="primary">Issue book</button>
          </form>
        </div>
        <div className="card">
          <h2>Overdue loans</h2>
          {!o.length ? (
            <div className="empty">No overdue loans.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Member</th>
                  <th>Due</th>
                  <th>Fine</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {o.map((x) => (
                  <tr key={x.id}>
                    <td>{x.book}</td>
                    <td>{x.member}</td>
                    <td>{new Date(x.due_date).toLocaleDateString()}</td>
                    <td>₹{Number(x.fine_amount || 0).toFixed(2)}</td>
                    <td>
                      <button className="link" onClick={() => ret(x.id)}>
                        Return
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Login register />} />
      <Route
        path="/*"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      />
    </Routes>
  );
}
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
