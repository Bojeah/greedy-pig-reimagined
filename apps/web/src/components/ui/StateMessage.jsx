// One place for the loading, empty and error messages every page needs.
export default function StateMessage({ kind = 'loading', text, action }) {
const colour =
kind === 'error' ? 'text-[#F17E8C] border-[#E71D3680]' : 'text-[#F9F7E8] border-[#ffffff40]';
return (
<div
role={kind === 'error' ? 'alert' : 'status'}
className={`mx-auto my-8 flex max-w-md flex-col items-center gap-4
rounded-lg border bg-[#ffffff10] p-6 text-center ${colour}`}
>
<p>{text}</p>
{action}
</div>
);
}
