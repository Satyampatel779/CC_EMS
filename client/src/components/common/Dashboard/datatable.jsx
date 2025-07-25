import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
export const DataTable = ({ noticedata }) => {
    // console.log("This is notice data", noticedata)
    const Notices = [
        // {
        //     invoice: "INV001",
        //     paymentStatus: "Paid",
        //     totalAmount: "$250.00",
        //     paymentMethod: "Credit Card",
        // },
        // {
        //     invoice: "INV002",
        //     paymentStatus: "Pending",
        //     totalAmount: "$150.00",
        //     paymentMethod: "PayPal",
        // },
        // {
        //     invoice: "INV003",
        //     paymentStatus: "Unpaid",
        //     totalAmount: "$350.00",
        //     paymentMethod: "Bank Transfer",
        // },
        // {
        //     invoice: "INV004",
        //     paymentStatus: "Paid",
        //     totalAmount: "$450.00",
        //     paymentMethod: "Credit Card",
        // },
        // {
        //     invoice: "INV005",
        //     paymentStatus: "Paid",
        //     totalAmount: "$550.00",
        //     paymentMethod: "PayPal",
        // },
        // {
        //     invoice: "INV006",
        //     paymentStatus: "Pending",
        //     totalAmount: "$200.00",
        //     paymentMethod: "Bank Transfer",
        // },
        // {
        //     invoice: "INV007",
        //     paymentStatus: "Unpaid",
        //     totalAmount: "$300.00",
        //     paymentMethod: "Credit Card",
        // },
        // {
        //     invoice: "INV008",
        //     paymentStatus: "Paid",
        //     totalAmount: "$550.00",
        //     paymentMethod: "PayPal",
        // },
        // {
        //     invoice: "INV009",
        //     paymentStatus: "Pending",
        //     totalAmount: "$200.00",
        //     paymentMethod: "Bank Transfer",
        // },
        // {
        //     invoice: "INV010",
        //     paymentStatus: "Unpaid",
        //     totalAmount: "$300.00",
        //     paymentMethod: "Credit Card",
        // },
        // {
        //     invoice: "INV011",
        //     paymentStatus: "Paid",
        //     totalAmount: "$550.00",
        //     paymentMethod: "PayPal",
        // },
        // {
        //     invoice: "INV012",
        //     paymentStatus: "Pending",
        //     totalAmount: "$200.00",
        //     paymentMethod: "Bank Transfer",
        // },
        // {
        //     invoice: "INV013",
        //     paymentStatus: "Unpaid",
        //     totalAmount: "$300.00",
        //     paymentMethod: "Credit Card",
        // },
        // {
        //     invoice: "INV014",
        //     paymentStatus: "Paid",
        //     totalAmount: "$550.00",
        //     paymentMethod: "PayPal",
        // },
        // {
        //     invoice: "INV015",
        //     paymentStatus: "Pending",
        //     totalAmount: "$200.00",
        //     paymentMethod: "Bank Transfer",
        // },
        // {
        //     invoice: "INV016",
        //     paymentStatus: "Unpaid",
        //     totalAmount: "$300.00",
        //     paymentMethod: "Credit Card",
        // },
        // {
        //     invoice: "INV017",
        //     paymentStatus: "Paid",
        //     totalAmount: "$550.00",
        //     paymentMethod: "PayPal",
        // },
        // {
        //     invoice: "INV018",
        //     paymentStatus: "Pending",
        //     totalAmount: "$200.00",
        //     paymentMethod: "Bank Transfer",
        // },
        // {
        //     invoice: "INV019",
        //     paymentStatus: "Unpaid",
        //     totalAmount: "$300.00",
        //     paymentMethod: "Credit Card",
        // },
        // {
        //     invoice: "INV020",
        //     paymentStatus: "Paid",
        //     totalAmount: "$550.00",
        //     paymentMethod: "PayPal",
        // },
        // {
        //     invoice: "INV021",
        //     paymentStatus: "Pending",
        //     totalAmount: "$200.00",
        //     paymentMethod: "Bank Transfer",
        // },
        // {
        //     invoice: "INV022",
        //     paymentStatus: "Unpaid",
        //     totalAmount: "$300.00",
        //     paymentMethod: "Credit Card",
        // },
    ]

    if (noticedata) {
        for (let index = 0; index < noticedata.notices.length; index++) {
            // console.log("This is notice data", noticedata.notices)
            Notices.push(
                {
                    noticeID: index + 1,
                    noticeTitle: noticedata.notices[index].title,
                    noticeAudience: noticedata.notices[index].audience,
                    noticeCreatedBy: `${noticedata.notices[index].createdby["firstname"]} ${noticedata.notices[index].createdby["lastname"]}`,
                }
            )
        }
    }

    console.log("Notice array", Notices)

    return (

        <div className="overflow-auto h-full">
            <div className="notices-heading mx-3 my-2">
                <p className="min-[250px]:text-xl xl:text-3xl font-bold min-[250px]:text-center sm:text-start text-gray-900 dark:text-neutral-100">Recent Notices</p>
            </div>
            <Table className="bg-white dark:bg-neutral-800">
                <TableHeader>
                    <TableRow className="border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700/50">
                        <TableHead className="w-[100px] text-gray-900 dark:text-neutral-100">Notice ID</TableHead>
                        <TableHead className="text-gray-900 dark:text-neutral-100">Title</TableHead>
                        <TableHead className="text-gray-900 dark:text-neutral-100">Audience</TableHead>
                        <TableHead className="text-right text-gray-900 dark:text-neutral-100">Created By</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>

                    {Notices.map((Notice) => (
                        <TableRow key={Notice.noticeID} className="border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700/50">
                            <TableCell className="font-medium text-gray-900 dark:text-neutral-100">{Notice.noticeID}</TableCell>
                            <TableCell className="text-gray-700 dark:text-neutral-300">{Notice.noticeTitle}</TableCell>
                            <TableCell className="text-gray-700 dark:text-neutral-300">{Notice.noticeAudience}</TableCell>
                            <TableCell className="text-right text-gray-700 dark:text-neutral-300">{Notice.noticeCreatedBy}</TableCell>
                        </TableRow>
                    ))}

                </TableBody>

                {/* <TableFooter>
                <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right">$2,500.00</TableCell>
                </TableRow>
            </TableFooter> */}
            </Table>
        </div>
    )
}