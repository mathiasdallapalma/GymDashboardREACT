import { Skeleton, Table } from "@chakra-ui/react"

const PendingExercises = () => {
  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader w="sm">ID</Table.ColumnHeader>
          <Table.ColumnHeader w="sm">Title</Table.ColumnHeader>
          <Table.ColumnHeader w="sm">Description</Table.ColumnHeader>
          <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {new Array(5).fill(null).map((_, index) => (
          <Table.Row key={index}>
            <Table.Cell>
              <Skeleton height="20px" />
            </Table.Cell>
            <Table.Cell>
              <Skeleton height="20px" />
            </Table.Cell>
            <Table.Cell>
              <Skeleton height="20px" />
            </Table.Cell>
            <Table.Cell>
              <Skeleton height="20px" />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

export default PendingExercises