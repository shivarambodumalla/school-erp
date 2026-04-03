'use client'

import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import { Check, X } from 'lucide-react'
import { TABLE_CONTAINER_CLASS, TABLE_HEADER_CLASS } from '@/lib/table-constants'
import type { LeaveRecord } from './leave-types'
import { STATUS_COLORS } from './leave-types'

interface Props {
  leaves: LeaveRecord[]
  onApprove: (leave: LeaveRecord) => void
  onReject: (leave: LeaveRecord) => void
}

export function LeaveTable({ leaves, onApprove, onReject }: Props) {
  if (leaves.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
        No leave records found
      </div>
    )
  }

  return (
    <div className={TABLE_CONTAINER_CLASS}>
      <Table>
        <TableHeader className={TABLE_HEADER_CLASS}>
          <TableRow>
            <TableHead>Staff</TableHead>
            <TableHead>Leave Type</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead className="text-center">Days</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaves.map(leave => (
            <TableRow key={leave.id}>
              <TableCell className="font-medium whitespace-nowrap">
                {leave.staff?.firstName} {leave.staff?.lastName}
                <span className="block text-xs text-muted-foreground">
                  {leave.staff?.employeeNo}
                </span>
              </TableCell>
              <TableCell>{leave.leaveType.name}</TableCell>
              <TableCell className="whitespace-nowrap">
                {format(new Date(leave.fromDate), 'dd MMM yyyy')}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {format(new Date(leave.toDate), 'dd MMM yyyy')}
              </TableCell>
              <TableCell className="text-center">{leave.totalDays}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {leave.reason}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={STATUS_COLORS[leave.status]}
                >
                  {leave.status}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {format(new Date(leave.appliedAt), 'dd MMM yyyy')}
              </TableCell>
              <TableCell className="text-right">
                {leave.status === 'PENDING' && (
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                      onClick={() => onApprove(leave)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                      onClick={() => onReject(leave)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
