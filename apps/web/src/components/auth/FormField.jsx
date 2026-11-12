// A label and an input that belong together. The label makes the field
//usable with a screen reader.
export default function FormField({ id, label, hint, ...inputProps }) {
return (
<div className="flex flex-col gap-1">
<label htmlFor={id} className="font-bold">
{label}
</label>
<input
id={id}
className="rounded-md border bg-[#ffffff20] p-3 text-white focusvisible:outline focus-visible:outline-2 focus-visible:outline-[#D30CBD]"
{...inputProps}
/>
{hint && <p className="text-xs text-[#ffffffa0]">{hint}</p>}
</div>
);
}