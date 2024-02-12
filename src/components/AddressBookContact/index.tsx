
interface IProps {
    nickname: string;
    address: string;
}
const AddressBookContact = ({nickname, address}: IProps) => {


    return <div><h3>{nickname}</h3><p>{address}</p></div>
}

export default AddressBookContact;