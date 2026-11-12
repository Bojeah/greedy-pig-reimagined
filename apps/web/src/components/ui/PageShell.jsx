import Navbar from 'src/components/Navbar';
// The frame every new page uses: the existing navigation bar, a title, and a
//padded content area.
export default function PageShell({ title, children, narrow = false }) {
return (
<div className="min-h-screen text-[#F9F7E8]">
<Navbar />
<section className={`mx-auto px-[5%] py-6 ${narrow ? 'max-w-md' : 'maxw-4xl'}`}>
{title && <h1 className="pri-font mb-6 text-center text-3xl sm:text4xl">{title}</h1>}
{children}
</section>
</div>
);
}
