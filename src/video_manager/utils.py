class TimeUtils:
    @staticmethod
    def print_sec(s):
        """ s -> hh:mm:ss.mss """
        [hours, s_m] = divmod(s, 3600)
        [minutes, seconds] = divmod(s_m, 60)
        return '{:0>2d}:{:0>2d}:{:0>2d}.000'.format(hours, minutes, seconds)

    @staticmethod
    def get_sec(s):
        """ hh:mm:ss.mss -> s """
        l = s.split('.')[0].split(':')
        return int(l[0]) * 3600 + int(l[1]) * 60 + int(l[2])