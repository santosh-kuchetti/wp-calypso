import type { RewindSizeInfo } from 'calypso/state/rewind/size/types';

type ApiResponse = {
	ok: boolean;
	error: string;
	size: number;
	days_of_backups_saved: number;
	min_days_of_backups_allowed: number;
	days_of_backups_allowed: number;
	retention_days: number;
};

const fromApi = ( {
	size,
	min_days_of_backups_allowed,
	days_of_backups_allowed,
	days_of_backups_saved,
	retention_days,
}: ApiResponse ): RewindSizeInfo => ( {
	bytesUsed: size,
	minDaysOfBackupsAllowed: min_days_of_backups_allowed,
	daysOfBackupsAllowed: days_of_backups_allowed,
	daysOfBackupsSaved: days_of_backups_saved,
	retentionDays: retention_days,
} );

export default fromApi;
