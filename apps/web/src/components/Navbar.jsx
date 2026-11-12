import logo from "../assets/pig-0.png";
import { Link } from "react-router-dom";
import useAuth from "src/hooks/useAuth";
export default function Navbar() {
const { user, logout } = useAuth();
const linkClass = "text-[#ffffff] hover:underline duration-300 font-bold";return (
<nav className="sticky top-0 z-20 w-full flex justify-between gap-2 py-2
px-4 md:px-[2%] md:py-[2%] text-white border-b border-b-[#ffffff80] backdropblur items-center">
<a href={`/`} className="flex lg:gap-2 items-center">
<h1 className="pri-font text-base sm:text-lg md:text-xl lg:text-2xl
xl:text-4xl ">
Greedy Pig
</h1>
<img src={logo} alt="logo" width={75} />
</a>
<div className="flex items-center gap-3 text-sm md:gap-6 md:text-base">
<Link to={`/leaderboard`} className={linkClass}>
Leaderboard
</Link>
<Link to={`/live-game/how-to-play`} className={`${linkClass} hidden
md:flex`}>
How To Play?
</Link>
<Link to={`/live-game/how-to-play`} className={`${linkClass} flex
text-xl md:hidden`}>
?
</Link>
{user ? (
<>
<Link to={`/profile`} className={`${linkClass} max-w-[100px]
truncate md:max-w-none`}>
{user.username}
</Link>
<button onClick={logout} className={linkClass}>
Log out
</button>
</>
) : (
<Link to={`/login`} className={linkClass}>
Log in
</Link>
)}
</div>
</nav>
);
}
