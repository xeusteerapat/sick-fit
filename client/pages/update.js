import UpdateItem from '../components/UpdateItem';

export default function Sell({ query }) {
  return (
    <div>
      <UpdateItem id={query.id} />
    </div>
  );
}
